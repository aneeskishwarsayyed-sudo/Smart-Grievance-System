# Step 1: Build Stage
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy everything
COPY . .

# FORCE EXECUTE PERMISSION (Fixes Error 126)
RUN chmod +x gradlew

# Build the application
RUN ./gradlew bootJar --no-daemon

# Step 2: Runtime Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the JAR (wildcard matches any name Gradle generates)
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]