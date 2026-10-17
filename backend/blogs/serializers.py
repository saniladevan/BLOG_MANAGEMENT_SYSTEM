from rest_framework import serializers
from .models import BlogPost, Comment


class BlogPostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(
        source="author.username"
    )

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "content",
            "author", "created_at", "updated_at"
        ]
        read_only_fields = [
            "id", "author", "created_at", "updated_at"
        ]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Title cannot be empty."
            )
        return value.strip()

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Content cannot be empty."
            )
        return value.strip()


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(
        source="author.username"
    )

    class Meta:
        model = Comment
        fields = ["id", "post", "author", "content", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Comment cannot be empty."
            )
        return value.strip()