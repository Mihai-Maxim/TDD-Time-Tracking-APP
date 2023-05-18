# Project

Create a work time tracking app with one employer and employees.

The app allows the employer and employees to log in using their email and password.
Employees can check-in to begin a working session and check-out to end the working session. When checking out, employees must provide a description of what they accomplished during the session. The start date, end date, and description are recorded.

Once an employee checks in, they must check out before starting another work session. If an employee fails to check out within 24 hours of the last check-in, the session is automatically deleted, and they can start a new work session by checking in again.

The employer has access to view the work history of any employee, while an employee can only see their own history.

## Tasks

1. Create a `/login` endpoint that allows users (employees or employer) to log in to the platform using an email and password.  
* The endpoint returns an Authorization token with a `200` status code if the credentials are valid.  
* If the credentials are invalid, the endpoints returns a `401` status code.  
* If the credentials are not provided, the endpoint returns a `400` status code. 

2. Create a `/logout` endpoint that logs the users out of the platform.  
* It invalidates the Authorization token received from the `/login` endpoint and returns a `200` status code.  
* If the Authorization header is expired or it was not provided, the endpoint returns a `400` status code.  

3. Create a `/check-in` endpoint that starts a work session for the logged-in employee.  
* The endpoint should only be accessible to employees.  
* It attaches the checked-in status to the employee.  
* An employee can only check in if they are not already checked in. 
* It returns `403` if the user is not logged in or if the user is an employer.  
* If the employer was not already checked in, the endpoint returns a status of `200` with the following response: `success: true, check_in_date: the date when the check-in took place`.  
* If the employee was already checked in, the endpoint returns a status of `200` with the following response: `success: false, check_in_date: the last check-in date`.  

4. Create a `/check-out` endpoint that allows logged-in employees to check out.  
* It attaches the checked-out status to the employee.  
* The employee must provide a description of what they accomplished during the previous work session.  
* If the request is successful, the start date, end date, and description are recorded and returned as the response from the endpoint with a `200` status code and `success: true`.  
* It returns `403` if the user is not logged in or if the user is an employer.  
* It returns `400` if the employee does not provide a description.   
* If the employee was not checked in when making the request, it returns `200` with the following response: `success: false, error: "you are not checked in"`.  

5. Create a `/history` endpoint that returns the work data recorded for a particular employee.  
* Both the employees and the employer can access this endpoint.  
* When called by an employee, the endpoint returns their own work data record.  
* When called by the employer, the endpoint returns the work data of all employees.   
* The employer can also provide the `q=<employee_email_address>` query parameter to retrieve the work data of a specific employee.  
* It returns `403` if the user is not logged in or if the employee tries to use the `q` query parameter.  
* If there is no employee with the specified email address registered in the system, it returns `404`.  


