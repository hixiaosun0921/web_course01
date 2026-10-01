package com.example.courseselect;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.courseselect.mapper")
public class CourseSelectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CourseSelectApplication.class, args);
    }
}
