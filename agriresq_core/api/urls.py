from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView, MeView,
    SensorDataView, DashboardView, PredictView,
    AnalyzeFreshnessView, IotAnalyzeProductView,
    CropBatchViewSet, MarketplaceViewSet, NotificationViewSet,
    ChatThreadViewSet, IoTNodeViewSet,
)

router = DefaultRouter()
router.register(r'inventory', CropBatchViewSet, basename='inventory')
router.register(r'batches', CropBatchViewSet, basename='batches')
router.register(r'marketplace', MarketplaceViewSet, basename='marketplace')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'chat', ChatThreadViewSet, basename='chat')
router.register(r'nodes', IoTNodeViewSet, basename='nodes')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('sensor-data/', SensorDataView.as_view(), name='sensor-data'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('predict/<int:batch_id>/', PredictView.as_view(), name='predict'),
    path('analyze-freshness/', AnalyzeFreshnessView.as_view(), name='analyze-freshness'),
    path('iot/analyze-product/', IotAnalyzeProductView.as_view(), name='iot-analyze-product'),
    path('', include(router.urls)),
]
