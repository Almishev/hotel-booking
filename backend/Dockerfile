FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy Maven wrapper files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies (cached layer if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# Copy the JAR file (exclude *original.jar files)
RUN JAR_FILE=$(find target -name "*.jar" -not -name "*original*" | head -1) && cp "$JAR_FILE" app.jar

# Expose port (Render sets PORT env var, default to 10000)
EXPOSE 10000

# Run the application (Render will override PORT via environment variable)
ENTRYPOINT ["java", "-jar", "app.jar"] 