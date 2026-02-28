FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR
COPY target/crawlservice-0.0.1-SNAPSHOT.jar app.jar

# Create entrypoint script expected by docker-compose base config
RUN echo '#!/bin/bash\nexec java ${JAVA_TOOL_OPTIONS} -jar /app/app.jar "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Create non-root user
RUN groupadd -r spring && useradd -r -g spring spring && chown spring:spring app.jar

EXPOSE 8085

ENTRYPOINT ["/entrypoint.sh"]
