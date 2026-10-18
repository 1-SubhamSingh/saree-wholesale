# Multi-stage Dockerfile for Spring Boot Java 21 Backend

# --- Stage 1: Build Application JAR ---
FROM maven:3.9.9-eclipse-temurin-21-jammy AS builder
WORKDIR /build

# Pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build package
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Runtime Environment ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install curl for container health check
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Run with non-root spring user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Create uploads directory with appropriate permissions
RUN mkdir -p /app/uploads && chown -R spring:spring /app

# Copy built artifact from builder
COPY --from=builder /build/target/*.jar app.jar
RUN chown spring:spring app.jar

USER spring:spring

EXPOSE 8080

VOLUME ["/app/uploads"]

ENTRYPOINT ["java", "-jar", "app.jar"]
