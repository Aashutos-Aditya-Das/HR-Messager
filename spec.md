# HR Emails Cold Messager

## Overview
A web application that helps job seekers create personalized email campaigns to HR contacts by analyzing their communication style and generating targeted outreach emails.

## Core Features

### File Upload System
- Upload HR contact lists in CSV or Excel format containing email addresses and optional company information
- Upload sample emails previously sent to HRs for style analysis
- Upload candidate resume and LinkedIn profile documents

### Contact Management
- Store uploaded HR contacts with email addresses and company information
- Automatically determine company names from email domains when not provided
- Track contact status (pending, sent, responded, etc.)

### Email Generation
- Analyze uploaded sample emails to learn the user's writing style and tone
- Generate two types of email templates:
  1. **General Outreach**: Personalized emails that present the candidate, reference the HR's company, align candidate skills with company objectives, and request job opportunities
  2. **Role-Specific**: Targeted emails for recent job posts (last 5 days) tailored to specific job descriptions and companies
- Use candidate resume and LinkedIn profile information to personalize content

### Email Queue Management
- Queue up to 400 emails per day for sending
- Provide email preview and editing capabilities before queuing
- Export queued emails for external sending (no automated mass emailing)

### Dashboard
- Display overview of contact lists, generated emails, and campaign status
- Allow review and editing of generated email templates
- Show contact management with status tracking
- Provide campaign analytics and progress tracking

## Backend Data Storage
- HR contact lists with email addresses, company information, and contact status
- Uploaded sample emails for style analysis
- Candidate resume and LinkedIn profile content
- Generated email templates and their associated contacts
- Email queue with daily limits and sending status
- User campaign data and analytics

## Backend Operations
- Process and parse uploaded CSV/Excel files
- Analyze sample emails to extract writing patterns and style
- Generate personalized email content using AI/template systems
- Manage daily email quotas and queue limitations
- Track email status and campaign progress
