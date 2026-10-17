from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User

from .models import BlogPost, Comment
from .serializers import BlogPostSerializer, CommentSerializer
from .permissions import IsOwnerOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
        })

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.select_related("author").all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related(
        "author", "post"
    ).all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        post_id = self.request.data.get("post")

        if not BlogPost.objects.filter(id=post_id).exists():
            raise ValidationError({"post": "Blog post not found."})

        serializer.save(author=self.request.user)

