ARG BUILD_CONFIGURATION=Release
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app/users
EXPOSE 8081


FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["ApplicationUsers.API/ApplicationUsers.API.csproj", "ApplicationUsers.API/"]
COPY ["ApplicationUsers.App/ApplicationUsers.App.csproj", "ApplicationUsers.App/"]
COPY ["ApplicationUsers.Domain/ApplicationUsers.Domain.csproj", "ApplicationUsers.Domain/"]
COPY ["ApplicationUsers.Infrastructure/ApplicationUsers.Infrastructure.csproj", "ApplicationUsers.Infrastructure/"]
RUN dotnet restore "ApplicationUsers.API/ApplicationUsers.API.csproj"
COPY . .
WORKDIR "/src/ApplicationUsers.API"
RUN dotnet build "./ApplicationUsers.API.csproj" -c $BUILD_CONFIGURATION -o /app/build


FROM build AS publish
ARG BUILD_CONFIGURATION
RUN dotnet publish "./ApplicationUsers.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false


FROM base AS final
WORKDIR  /app/users
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ApplicationUsers.API.dll"]