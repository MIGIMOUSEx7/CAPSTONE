import secrets
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('WHOLESALER', 'Wholesaler'),
        ('RESCUE_BUYER', 'Rescue Buyer'),
        ('ADMIN', 'Administrator'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class WholesalerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wholesaler_profile')
    stall_number = models.CharField(max_length=50)
    market_location = models.CharField(max_length=255, default="Bulua WBIT Terminal")
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - Stall {self.stall_number}"


class RescueBuyerProfile(models.Model):
    BUYER_TYPE_CHOICES = [
        ('RETAILER', 'Secondary Retailer'),
        ('PROCESSOR', 'Food Processor'),
        ('CONSUMER', 'Bulk Consumer'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    buyer_type = models.CharField(max_length=20, choices=BUYER_TYPE_CHOICES, default='RETAILER')
    address = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.buyer_type})"


class IoTNode(models.Model):
    wholesaler = models.ForeignKey(WholesalerProfile, on_delete=models.CASCADE, related_name='nodes')
    device_token = models.CharField(max_length=64, unique=True)
    stall_location = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    battery_level = models.IntegerField(default=100)
    last_seen = models.DateTimeField(null=True, blank=True)

    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)

    def __str__(self):
        return f"Node {self.id} ({self.stall_location})"


class CropBatch(models.Model):
    CROP_CHOICES = [
        ('EGGPLANT', 'Eggplant'),
        ('CUCUMBER', 'Cucumber'),
        ('CARROT', 'Carrot'),
    ]
    STATUS_CHOICES = [
        ('GREEN', 'Fresh'),
        ('AMBER', 'At-Risk'),
        ('RED', 'Spoiled'),
    ]

    wholesaler = models.ForeignKey(WholesalerProfile, on_delete=models.CASCADE, related_name='batches')
    iot_node = models.ForeignKey(IoTNode, on_delete=models.SET_NULL, null=True, blank=True)
    crop_type = models.CharField(max_length=20, choices=CROP_CHOICES)
    quantity_kg = models.DecimalField(max_digits=6, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    freshness_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='GREEN')
    predicted_shelf_life = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    freshness_percent = models.IntegerField(default=100)
    harvest_date = models.DateField(null=True, blank=True)
    arrival_time = models.DateTimeField(default=timezone.now)
    image_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    pickup_location = models.CharField(max_length=255, default="Bulua West Terminal")
    is_listed = models.BooleanField(default=False)

    @property
    def total_price(self):
        return self.quantity_kg * self.price_per_kg

    def __str__(self):
        return f"{self.crop_type} Batch #{self.id} ({self.freshness_status})"


class SensorLog(models.Model):
    iot_node = models.ForeignKey(IoTNode, on_delete=models.CASCADE, related_name='logs')
    crop_batch = models.ForeignKey(CropBatch, on_delete=models.CASCADE, related_name='sensor_logs', null=True, blank=True)
    temperature_c = models.DecimalField(max_digits=5, decimal_places=2)
    humidity_rh = models.DecimalField(max_digits=5, decimal_places=2)
    ethylene_ppm = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    vpd_value = models.DecimalField(max_digits=6, decimal_places=4, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Log {self.id} - Node {self.iot_node_id} at {self.timestamp}"


class SpoilagePrediction(models.Model):
    crop_batch = models.ForeignKey(CropBatch, on_delete=models.CASCADE, related_name='predictions')
    sensor_log = models.ForeignKey(SensorLog, on_delete=models.SET_NULL, null=True, blank=True)
    predicted_status = models.CharField(max_length=10, choices=CropBatch.STATUS_CHOICES)
    days_to_spoil = models.DecimalField(max_digits=5, decimal_places=2)
    chu_accumulated = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prediction for Batch {self.crop_batch_id}: {self.predicted_status}"


class MarketplaceListing(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('SOLD', 'Sold'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    ]
    crop_batch = models.OneToOneField(CropBatch, on_delete=models.CASCADE, related_name='listing')
    wholesaler = models.ForeignKey(WholesalerProfile, on_delete=models.CASCADE, related_name='listings')
    listed_price = models.DecimalField(max_digits=10, decimal_places=2)
    listing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Listing #{self.id} - {self.crop_batch.crop_type}"


class PushNotification(models.Model):
    TYPE_CHOICES = [
        ('STATUS_CHANGE', 'Status Change'),
        ('IOT_ALERT', 'IoT Alert'),
        ('ORDER_UPDATE', 'Order Update'),
        ('NEW_MESSAGE', 'New Message'),
        ('MARKETPLACE', 'Marketplace'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    crop_batch = models.ForeignKey(CropBatch, on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type}: {self.title}"


class ChatThread(models.Model):
    listing = models.ForeignKey(MarketplaceListing, on_delete=models.CASCADE, related_name='threads')
    wholesaler = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_threads')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_threads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['listing', 'buyer']

    def __str__(self):
        return f"Chat: {self.wholesaler.username} <-> {self.buyer.username}"


class ChatMessage(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message_text = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"Msg from {self.sender.username} at {self.sent_at}"
