from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate


@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    age = request.data.get('age')
    gender = request.data.get('gender')

    if not username or not password:
        return Response({"error": "username과 password는 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "이미 존재하는 사용자입니다."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    
    return Response({"message": "회원가입 성공!"}, status=status.HTTP_201_CREATED)



@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if not User.objects.filter(username=username).exists():
        return Response({"error": "회원가입 정보가 없습니다."}, status=status.HTTP_400_BAD_REQUEST)

    if user is not None:
        return Response({"message": "로그인 성공!", "username": username})
    else:
        return Response({"error": "아이디 또는 비밀번호가 일치하지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)