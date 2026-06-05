from datetime import date, timedelta

from django.db.models import Count

from .models import Booking, Room


MODEL_NAME = 'Prophet forecasting model'
ALGORITHM = 'Additive time-series forecasting algorithm'


def _prophet_imports():
    from prophet import Prophet
    import pandas as pd
    return Prophet, pd


def _daily_booking_rows():
    rows = (
        Booking.objects
        .exclude(status='Cancelled')
        .values('check_in')
        .annotate(y=Count('id'))
        .order_by('check_in')
    )
    return [(r['check_in'], float(r['y'])) for r in rows]


def _dense_daily_series(rows, pd):
    if not rows:
        today = date.today()
        return pd.DataFrame({'ds': [today - timedelta(days=1), today], 'y': [0.0, 0.0]})

    start, end = rows[0][0], rows[-1][0]
    if start == end:
        start = start - timedelta(days=1)

    values = {d: y for d, y in rows}
    days = (end - start).days + 1
    return pd.DataFrame({
        'ds': [start + timedelta(days=i) for i in range(days)],
        'y': [values.get(start + timedelta(days=i), 0.0) for i in range(days)],
    })


def _fit_booking_model():
    Prophet, pd = _prophet_imports()
    df = _dense_daily_series(_daily_booking_rows(), pd)

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.90,
    )
    model.fit(df)
    return model, df, pd


def prophet_available():
    try:
        _prophet_imports()
        return True
    except Exception:
        return False


def model_metadata():
    training_records = Booking.objects.exclude(status='Cancelled').count()
    return {
        'model': MODEL_NAME,
        'algorithm': ALGORITHM,
        'purpose': 'Predict future booking demand and occupancy trends',
        'available': prophet_available(),
        'training_records': training_records,
        'status_label': 'MODEL ACTIVE' if training_records else 'MODEL WAITING',
        'training_message': (
            f'Learning from {training_records:,} booking records. '
            'Accuracy grows as bookings are added.'
        ),
    }


def forecast_daily(days=90):
    model, df, pd = _fit_booking_model()
    future = model.make_future_dataframe(periods=days, freq='D')
    forecast = model.predict(future)
    last_train_date = pd.to_datetime(df['ds']).max()
    future_rows = forecast[forecast['ds'] > last_train_date].copy()
    future_rows['yhat'] = future_rows['yhat'].clip(lower=0)
    future_rows['yhat_lower'] = future_rows['yhat_lower'].clip(lower=0)
    future_rows['yhat_upper'] = future_rows['yhat_upper'].clip(lower=0)
    return future_rows


def forecast_ranges():
    rows = forecast_daily(90)
    active_rooms = Room.objects.filter(status='Active').count() or 1

    result = []
    for days, label in [(7, 'Next 7 days'), (30, 'Next 30 days'), (90, 'Next 90 days')]:
        window = rows.head(days)
        bookings = float(window['yhat'].sum())
        lower = float(window['yhat_lower'].sum())
        upper = float(window['yhat_upper'].sum())
        occ = min(100, (bookings / max(active_rooms * days, 1)) * 100)
        avg_rev = _average_revenue()
        result.append({
            'range': label,
            'bookings': round(bookings),
            'occ': f'{occ:.0f}%',
            'conf': f'+/- {round(max(bookings - lower, upper - bookings))}',
            'rev': _fmt_rev(bookings * avg_rev),
            'model': MODEL_NAME,
            'algorithm': ALGORITHM,
        })
    return result


def actual_vs_predicted_monthly():
    model, df, pd = _fit_booking_model()
    future = model.make_future_dataframe(periods=62, freq='D')
    forecast = model.predict(future)

    actual = df.copy()
    actual['month'] = pd.to_datetime(actual['ds']).dt.to_period('M')
    actual_monthly = actual.groupby('month')['y'].sum()

    forecast['month'] = pd.to_datetime(forecast['ds']).dt.to_period('M')
    forecast_monthly = forecast.groupby('month')[['yhat', 'yhat_lower', 'yhat_upper']].sum()

    today = date.today()
    months = []
    y, m = today.year, today.month
    for _ in range(12):
        months.append(pd.Period(f'{y}-{m:02d}', freq='M'))
        m -= 1
        if m == 0:
            m, y = 12, y - 1
    months = list(reversed(months))
    for _ in range(2):
        months.append(months[-1] + 1)

    labels, actual_values, predicted, upper, lower = [], [], [], [], []
    current_month = pd.Period(f'{today.year}-{today.month:02d}', freq='M')

    for month in months:
        labels.append(month.to_timestamp().strftime('%b'))
        if month <= current_month:
            actual_values.append(round(float(actual_monthly.get(month, 0))))
            predicted.append(None)
            upper.append(None)
            lower.append(None)
        else:
            actual_values.append(None)
            row = forecast_monthly.loc[month] if month in forecast_monthly.index else None
            yhat = max(0, float(row['yhat'])) if row is not None else 0
            predicted.append(round(yhat))
            upper.append(round(max(0, float(row['yhat_upper']))) if row is not None else 0)
            lower.append(round(max(0, float(row['yhat_lower']))) if row is not None else 0)

    return {
        'labels': labels,
        'actual': actual_values,
        'predicted': predicted,
        'upper': upper,
        'lower': lower,
        'model': MODEL_NAME,
        'algorithm': ALGORITHM,
    }


def _average_revenue():
    completed = Booking.objects.filter(status__in=['Confirmed', 'Completed'])
    amounts = [b.amount for b in completed if b.amount]
    return (sum(amounts) / len(amounts)) if amounts else 3500


def _fmt_rev(n):
    if n >= 1_000_000:
        return f'PHP {n / 1_000_000:.2f}M'
    return f'PHP {round(n / 1000)}K'
