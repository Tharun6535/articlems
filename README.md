# Spring Boot H2 Database CRUD example: Building Rest API with Spring Data JPA

For more detail, please visit:
> [Spring Boot JPA + H2 example: Build a CRUD Rest APIs](https://www.bezkoder.com/spring-boot-jpa-h2-example/)

In this articleEntity, we're gonna build a Spring Boot Rest CRUD API example with Maven that use Spring Data JPA to interact with H2 database. You'll know:

- How to configure Spring Data, JPA, Hibernate to work with Database
- How to define Data Models and Repository interfaces
- Way to create Spring Rest Controller to process HTTP requests
- Way to use Spring Data JPA to interact with H2 Database

Front-end that works well with this Back-end
> [Angular 8](https://www.bezkoder.com/angular-crud-app/) / [Angular 10](https://www.bezkoder.com/angular-10-crud-app/) / [Angular 11](https://www.bezkoder.com/angular-11-crud-app/) / [Angular 12](https://www.bezkoder.com/angular-12-crud-app/) / [Angular 13](https://www.bezkoder.com/angular-13-crud-example/) / [Angular 14](https://www.bezkoder.com/angular-14-crud-example/) / [Angular 15](https://www.bezkoder.com/angular-15-crud-example/) / [Angular 16 Client](https://www.bezkoder.com/angular-16-crud-example/)

> [Vue 2 Client](https://www.bezkoder.com/vue-js-crud-app/) / [Vue 3 Client](https://www.bezkoder.com/vue-3-crud/) / [Vuetify Client](https://www.bezkoder.com/vuetify-data-table-example/)

> [React Client](https://www.bezkoder.com/react-hooks-crud-axios-api/) / [React Redux Client](https://www.bezkoder.com/redux-toolkit-crud-react-hooks/)

More Practice:
> [Spring Boot Validate Request Body](https://www.bezkoder.com/spring-boot-validate-request-body/)

> [Spring Boot File upload example with Multipart File](https://www.bezkoder.com/spring-boot-file-upload/)

> [Spring Boot Pagination & Filter example | Spring JPA, Pageable](https://www.bezkoder.com/spring-boot-pagination-filter-jpa-pageable/)

> [Spring Data JPA Sort/Order by multiple Columns | Spring Boot](https://www.bezkoder.com/spring-data-sort-multiple-columns/)

> [Spring Boot Repository Unit Test with @DataJpaTest](https://www.bezkoder.com/spring-boot-unit-test-jpa-repo-datajpatest/)

> [Spring Boot Rest Controller Unit Test with @WebMvcTest](https://www.bezkoder.com/spring-boot-webmvctest/)

> Cache the result: [Spring Boot Redis Cache example](https://www.bezkoder.com/spring-boot-redis-cache-example/)

> Documentation: [Spring Boot with Swagger 3 example](https://www.bezkoder.com/spring-boot-swagger-3/)

> Reactive Rest API: [Spring Boot WebFlux example](https://www.bezkoder.com/spring-boot-webflux-rest-api/)

> [Deploy Spring Boot App on AWS – Elastic Beanstalk](https://www.bezkoder.com/deploy-spring-boot-aws-eb/)

Exception Handling:
> [Spring Boot @ControllerAdvice & @ExceptionHandler example](https://www.bezkoder.com/spring-boot-controlleradvice-exceptionhandler/)

> [@RestControllerAdvice example in Spring Boot](https://www.bezkoder.com/spring-boot-restcontrolleradvice/)

Associations:
> [Spring Boot One To One example with Spring JPA, Hibernate](https://www.bezkoder.com/jpa-one-to-one/)

> [Spring Boot One To Many example with Spring JPA, Hibernate](https://www.bezkoder.com/jpa-one-to-many/)

> [Spring Boot Many To Many example with Spring JPA, Hibernate](https://www.bezkoder.com/jpa-many-to-many/)

Other databases:
> [Spring Boot JPA + MySQL: CRUD Rest API example](https://www.bezkoder.com/spring-boot-jpa-crud-rest-api/)

> [Spring Boot JPA + PostgreSQL: CRUD Rest API example](https://www.bezkoder.com/spring-boot-postgresql-example/)

Security:
> [Spring Boot + Spring Security JWT Authentication & Authorization](https://www.bezkoder.com/spring-boot-jwt-authentication/)

Fullstack:
> [Vue + Spring Boot example](https://www.bezkoder.com/spring-boot-vue-js-crud-example/)

> [Angular 8 + Spring Boot example](https://www.bezkoder.com/angular-spring-boot-crud/)

> [Angular 10 + Spring Boot example](https://www.bezkoder.com/angular-10-spring-boot-crud/)

> [Angular 11 + Spring Boot example](https://www.bezkoder.com/angular-11-spring-boot-crud/)

> [Angular 12 + Spring Boot example](https://www.bezkoder.com/angular-12-spring-boot-crud/)

> [Angular 13 + Spring Boot example](https://www.bezkoder.com/spring-boot-angular-13-crud/)

> [Angular 14 + Spring Boot example](https://www.bezkoder.com/spring-boot-angular-14-crud/)

> [Angular 15 + Spring Boot example](https://www.bezkoder.com/spring-boot-angular-15-crud/)

> [Angular 16 + Spring Boot example](https://www.bezkoder.com/spring-boot-angular-16-crud/)

> [React + Spring Boot + MySQL example](https://www.bezkoder.com/react-spring-boot-crud/)

> [React + Spring Boot + PostgreSQL example](https://www.bezkoder.com/spring-boot-react-postgresql/)

Run both Back-end & Front-end in one place:
> [Integrate Angular with Spring Boot Rest API](https://www.bezkoder.com/integrate-angular-spring-boot/)

> [Integrate React.js with Spring Boot Rest API](https://www.bezkoder.com/integrate-reactjs-spring-boot/)

> [Integrate Vue.js with Spring Boot Rest API](https://www.bezkoder.com/integrate-vue-spring-boot/)

# Environment Configuration

This application supports multiple environments: Development, Test, and Production.

## Environment Profiles

### Development (dev)
- In-memory H2 database for easy development
- Debug logging enabled
- H2 console available at `/h2-console`
- Default profile if none specified

### Test (test)
- In-memory H2 database with `create-drop` strategy
- Increased logging for debugging
- Integration tests run in this profile
- Separate file upload directory for test files

### Production (prod)
- MySQL database (configured via environment variables)
- Minimal logging
- SSL required
- Optimized for security and performance

## Running the Application

### Using Maven

With the appropriate profile:

```bash
# Development (default)
mvn spring-boot:run

# Test
mvn spring-boot:run -Dspring-boot.run.profiles=test

# Production
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Using Packaged JAR

```bash
# Development
java -jar app.jar --spring.profiles.active=dev

# Test 
java -jar app.jar --spring.profiles.active=test

# Production
java -jar app.jar --spring.profiles.active=prod
```

### Building for Specific Environment

Maven profiles are configured to build for each environment:

```bash
# Development build
mvn clean package -Pdev

# Test build
mvn clean package -Ptest

# Production build
mvn clean package -Pprod
```

## Environment Variables

### For Production

The following environment variables can be set for production:

| Variable | Description | Default |
|----------|-------------|---------|
| `MYSQL_HOST` | Database host | localhost |
| `MYSQL_PORT` | Database port | 3306 |
| `MYSQL_DB` | Database name | proddb |
| `MYSQL_USER` | Database username | root |
| `MYSQL_PASSWORD` | Database password | password |
| `JWT_SECRET` | Secret key for JWT | ProductionSecretKey... |
| `JWT_EXPIRATION` | JWT expiration in ms | 86400000 |
| `FILE_UPLOAD_DIR` | Directory for uploads | /app/uploads |
| `CORS_ORIGINS` | Allowed origins for CORS | https://yourdomain.com |
| `MAIL_HOST` | SMTP server host | smtp.example.com |
| `MAIL_PORT` | SMTP server port | 587 |
| `MAIL_USERNAME` | SMTP username | your_email@example.com |
| `MAIL_PASSWORD` | SMTP password | your_password |
| `FRONTEND_URL` | Frontend application URL | https://yourdomain.com |
```

