from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurrentUserView

# Add inside urlpatterns:
path("auth/me/", CurrentUserView.as_view(), name="current-user"),
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import BlogPostViewSet, CommentViewSet

router = DefaultRouter()
router.register("posts", BlogPostViewSet, basename="post")
router.register("comments", CommentViewSet, basename="comment")

urlpatterns = [
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("", include(router.urls)),
]