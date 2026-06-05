import json

from django.conf import settings

from .models import PushSubscription


def webpush_configured():
    return bool(settings.WEBPUSH_VAPID_PUBLIC_KEY and settings.WEBPUSH_VAPID_PRIVATE_KEY)


def send_user_push(user, title, body, url='/customer/trips'):
    if not webpush_configured():
        return 0

    try:
        from pywebpush import WebPushException, webpush
    except ImportError:
        return 0

    sent = 0
    payload = json.dumps({'title': title, 'body': body, 'url': url})
    for sub in user.push_subscriptions.all():
        subscription_info = {
            'endpoint': sub.endpoint,
            'keys': {
                'p256dh': sub.p256dh,
                'auth': sub.auth,
            },
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=settings.WEBPUSH_VAPID_PRIVATE_KEY,
                vapid_claims={'sub': settings.WEBPUSH_VAPID_SUBJECT},
            )
            sent += 1
        except WebPushException as exc:
            status = getattr(getattr(exc, 'response', None), 'status_code', None)
            if status in (404, 410):
                sub.delete()
        except Exception:
            continue
    return sent
