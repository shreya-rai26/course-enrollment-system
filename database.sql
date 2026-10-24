IF DB_ID('CourseEnrollment') IS NULL
BEGIN
    CREATE DATABASE CourseEnrollment;
END
GO
USE CourseEnrollment;
GO
IF OBJECT_ID('Enrollments', 'U') IS NOT NULL DROP TABLE Enrollments;
IF OBJECT_ID('Courses', 'U') IS NOT NULL DROP TABLE Courses;
IF OBJECT_ID('Students', 'U') IS NOT NULL DROP TABLE Students;
GO
CREATE TABLE Students (
    StudentID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE
);
GO
CREATE TABLE Courses (
    CourseID INT PRIMARY KEY,
    CourseName VARCHAR(150) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0)
);
GO
CREATE TABLE Enrollments (
    EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    CourseID INT NOT NULL,
    EnrollmentDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Enrollments_Students FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    CONSTRAINT FK_Enrollments_Courses FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    CONSTRAINT UQ_Student_Course UNIQUE (StudentID, CourseID)
);
GO
INSERT INTO Students (StudentID, Name, Email) VALUES
(101, 'Aarav Sharma', 'aarav@example.com'),
(102, 'Ananya Patil', 'ananya@example.com'),
(103, 'Rohan Verma', 'rohan@example.com'),
(104, 'Shreya Rai', 'shreya@example.com');
GO
INSERT INTO Courses (CourseID, CourseName, Capacity) VALUES
(201, 'Database Management Systems', 3),
(202, 'Computer Networks', 2),
(203, 'Artificial Intelligence', 4),
(204, 'Web Development', 3);
GO
INSERT INTO Enrollments (StudentID, CourseID) VALUES
(101, 201),
(102, 201),
(103, 202);
GO
