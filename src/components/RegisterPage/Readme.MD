# Xisabiye Credit Calculator

A simple app to manage customers and track money they owe you.

## What Does It Do?

This app helps you:
- **Login** - Sign in with your username and password
- **Add Customers** - Create a list of people who owe you money
- **Track Transactions** - Record when customers pay you or owe you money
- **View Reports** - See how much money customers owe in total
- **Edit & Delete** - Update or remove customers and transactions

## How to Use

### 1. Login
- Enter your username and password
- Switch between English and Somali languages

### 2. Dashboard
Three buttons to navigate:
- **Add New Transaction** - Record a payment or debt
- **Reports** - See summary of all money owed
- **Add New Client** - Create a new customer

### 3. Manage Customers
- Search customers by name or phone
- Add new customers with their name, phone, and notes
- Edit customer information
- Delete customers

### 4. Track Transactions
- Select a customer
- Add a transaction (payment received or amount owed)
- View all transactions for that customer
- Edit or delete transactions
- See the customer's current balance

### 5. View Reports
- See total number of customers
- See total amount paid
- See total amount owed
- See other useful statistics

## Technology Used

- **React** - Front-end framework
- **Zustand** - State management
- **Axios** - API requests
- **React Router** - Navigation

## Features

 User authentication (login)  
 Add, edit, delete customers  
 Add, edit, delete transactions  
 Search customers  
 View balance for each customer  
 Generate reports  
 Two languages (English & Somali)  
 Role-based access (Staff, Admin, Owner)  

## File Structure

```
Components:
- LoginPage - User login
- Dashboard - Main menu
- CustomersPage - Manage customers
- TransactionDetail - Track money
- Reports - View statistics
- RegisterPage - Create new users (admin only)
```
