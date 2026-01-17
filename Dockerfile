# Step 1: Build Stage
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy the Gradle wrapper and configuration files first (for caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Give permission to execute the gradlew script
RUN chmod +x gradlew

# Copy the rest of the source code
COPY . .

# Build the application
# This creates the "fat JAR" in build/libs/
RUN ./gradlew bootJar --no-daemon

# Step 2: Runtime Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the JAR from the build stage
# We use a wildcard to match the generated jar file name
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]