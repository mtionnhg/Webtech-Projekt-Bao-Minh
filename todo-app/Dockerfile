# Build Stage - Kompiliert die Anwendung
FROM gradle:8.14.3-jdk21 AS build
WORKDIR /app
COPY . .
RUN ./gradlew clean build -x test

# Runtime Stage - Führt die Anwendung aus
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV PORT=8080
CMD ["sh", "-c", "java -Dserver.port=$PORT -jar app.jar"]

