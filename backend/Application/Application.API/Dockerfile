ARG BUILD_CONFIGURATION=Release
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app/courses
EXPOSE 8080


FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Application.API/Application.API.csproj", "Application.API/"]
COPY ["Application.App/Application.App.csproj", "Application.App/"]
COPY ["Application.Domain/Application.Domain.csproj", "Application.Domain/"]
COPY ["Application.Infrastructure/Application.Infrastructure.csproj", "Application.Infrastructure/"]
RUN dotnet restore "Application.API/Application.API.csproj"
COPY . .
WORKDIR "/src/Application.API"
RUN dotnet build "./Application.API.csproj" -c $BUILD_CONFIGURATION -o /app/build


FROM build AS publish
ARG BUILD_CONFIGURATION
RUN dotnet publish "./Application.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false


FROM base AS final
WORKDIR /app/courses
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Application.API.dll"]