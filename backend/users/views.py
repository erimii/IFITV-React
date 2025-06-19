from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
User = get_user_model()

# 회원가입
@api_view(['POST'])
def signup(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "email과 password는 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"email": "이미 존재하는 사용자입니다."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(email=email, password=password)
    
    return Response({
        "email": user.email,
        "id": user.id,
        "message": "회원가입 성공"
    }, status=status.HTTP_201_CREATED)

# 로그인
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(email=email, password=password)

    if not User.objects.filter(email=email).exists():
        return Response({"error": "회원가입 정보가 없습니다."}, status=status.HTTP_400_BAD_REQUEST)

    if user is not None:
        return Response({"message": "로그인 성공!", "email": email, "id": user.id})
    else:
        return Response({"error": "이메일 또는 비밀번호가 일치하지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)