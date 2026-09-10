""" plantuml
@startuml
left to right direction

actor Student
actor "Teacher / Examiner" as Teacher
actor Administrator

rectangle "Online Examination System" {

    usecase "Log In" as UC1

    usecase "View Assigned Exams" as UC2
    usecase "Start Attempt" as UC3
    usecase "Answer Question" as UC4
    usecase "Submit Attempt" as UC5
    usecase "View Result" as UC6
    usecase "View History" as UC7

    usecase "Manage Question Bank" as UC8
    usecase "Create / Configure Exam" as UC9
    usecase "Assign Students" as UC10
    usecase "Publish Exam" as UC11
    usecase "Review Results" as UC12
    usecase "Review Integrity Flags" as UC13
    usecase "View Exam Analytics" as UC14

    usecase "Manage Users" as UC15
    usecase "Manage Roles" as UC16
    usecase "Oversee Exams / Questions / Attempts" as UC17
    usecase "View Platform Analytics" as UC18
}

Student --> UC1
Student --> UC2
Student --> UC3
Student --> UC4
Student --> UC5
Student --> UC6
Student --> UC7

Teacher --> UC1
Teacher --> UC8
Teacher --> UC9
Teacher --> UC10
Teacher --> UC11
Teacher --> UC12
Teacher --> UC13
Teacher --> UC14

Administrator --> UC1
Administrator --> UC15
Administrator --> UC16
Administrator --> UC17
Administrator --> UC18

@enduml
"""
