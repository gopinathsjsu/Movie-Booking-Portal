# Movie Booking System - Team Agile Wizards

Welcome to the Movie Booking System developed by Team Agile Wizards. Our system offers a seamless experience for users to browse currently showing movies, upcoming movies, book tickets, and much more!

## Team Members

- Vishnu Vardhan Reddy: 016816176
- Anudeep Goud Kotagiri: 017407377
- Komal Venugopal Vattumilli: 016860532
- Kaushikq Ravindran: 017426955

## Architecture Diagram

The architecture diagram provides a visual representation of the system's structure, showcasing the interaction between the client application, server, and external services such as the Stripe Payment gateway.

![Architecture Diagram](/images/movie_booking_system_architecture.png)

## Component Diagram

Our component diagrams illustrates the components of our system and how they interact with one another, ensuring modularity and ease of maintenance.

![Server Component Diagram](/images/server_component.png)

![Client Component Diagram](/images/client_component.png)

## AWS Deployment Diagram

We have deployed our application on AWS, utilizing services such as EC2, S3, and RDS to ensure scalability and reliability.

![AWS Deployment Diagram](/images/AWSDeploymentDiag.png)

## Cloud Deployment

- Deployed on AWS Cloud using EBS.
- Enabled Auto Scaling up to 3 instances and used ELB for load balancing.
- Added Alerts for status updates.

## Features

- **User Authentication:** Secure login and registration system for users.
- **Movie Browsing:** Users can browse currently showing and upcoming movies.
- **Ticket Booking:** A feature-rich booking system with support for selecting seats and applying discounts.
- **Membership Options:** Users can choose between Regular and Premium membership options.
- **Analytics Dashboard:** For theater employees to track occupancy and movie popularity.
- **Cloud Deployment:** Robust deployment on AWS for optimal performance and uptime.

## Team Contributions

Below is a summary of our team's contributions to the project:

| Backlog Item                               | Task                                                 | Task Owner                       |
| ------------------------------------------ | ---------------------------------------------------- | -------------------------------- |
| Design Phase and Discussions               | Brainstorm about Technologies                        | Anudeep, Komal, Vishnu, Kaushikq |
| API Development for General User Functions | Develop API for viewing movie schedules              | Anudeep                          |
| API Development for Membership Options     | Implement API for viewing membership options         | Vishnu                           |
| API Development for Movie Ticket Booking   | Create API for booking movie tickets                 | Anudeep                          |
| UI Development for Web Platform            | Design the user interface for various pages          | Kaushikq, Komal                  |
| Role-Based Access Control                  | Implement access control for various user roles      | Vishnu                           |
| Analytics Dashboard Development            | Develop an analytics dashboard for theater occupancy | Kaushikq                         |
| Cloud Deployment and Database Integration  | Set up the API and database on AWS EC2 cluster       | Komal                            |

## BurnDown Chart

![Burndown](/images/burndown.png)

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies for both the client and server.
3. Ensure that MongoDB is running on your local machine or use an external MongoDB service.
4. Start the server by running `npm start` in the server directory.
5. Start the client by running `npm start` in the client directory.

For detailed instructions, refer to the documentation provided within each directory.

## Documentation

Find all our project documentation, including sprint plans, task sheets, and more in the [documentation folder](/documentation/).

## Links

1. [Github Repository](https://github.com/gopinathsjsu/teamproject-agile-wizards)
2. [Project Journal](/documentation/CMPE202-AGWIZ-JOURNAL.pdf)
3. [Sprint Task Sheet](/documentation/Agile%20Wizards%20Sprint%20Sheet.xlsx)
4. [Project Board](/documentation/project_board/)
5. [UI Wireframes](/documentation/AGILEWIZARDS-WIREFRAMES.pdf)

## Feedback

We're always looking to improve! If you have any feedback or suggestions, please open an issue on our repository or contact one of our team members directly.

Thank you for checking out our Movie Booking System!
