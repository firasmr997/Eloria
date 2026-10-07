# syntax=docker/dockerfile:1

# ---- Build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src/ src/
RUN ./mvnw -B -q package -DskipTests && cp target/eloria-api-*.jar app.jar

# ---- Run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd --system eloria && useradd --system --gid eloria --home /app eloria \
    && mkdir -p /app/uploads && chown -R eloria:eloria /app
COPY --from=build --chown=eloria:eloria /workspace/app.jar /app/app.jar
USER eloria
EXPOSE 8087
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
# Readiness: GET /actuator/health/readiness (wire it into your orchestrator's health checks).
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
