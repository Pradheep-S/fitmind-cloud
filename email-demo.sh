#!/bin/bash

# FitMind Email System Demo Script
# This script demonstrates the email functionality

echo "🧠 FitMind Email System Demo"
echo "==============================="

# API Base URL
API_URL="http://localhost:5000/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📧 Testing Email System...${NC}"

# Test 1: Check if server is running
echo -e "\n${YELLOW}1. Checking server health...${NC}"
response=$(curl -s "${API_URL}/health" || echo "ERROR")
if [[ $response == *"FitMind API is running"* ]]; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not responding. Please start the backend server first.${NC}"
    exit 1
fi

# Test 2: Check scheduler status
echo -e "\n${YELLOW}2. Checking email scheduler status...${NC}"
# Note: This requires authentication, so we'll show the curl command
echo "To check scheduler status (requires auth token):"
echo "curl -H \"Authorization: Bearer YOUR_TOKEN\" ${API_URL}/email/scheduler/status"

# Test 3: Show email preferences endpoint
echo -e "\n${YELLOW}3. Email preferences endpoints:${NC}"
echo "GET  ${API_URL}/email/preferences          - Get current email preferences"
echo "PUT  ${API_URL}/email/preferences          - Update email preferences"

# Test 4: Manual email triggers
echo -e "\n${YELLOW}4. Manual email trigger endpoints:${NC}"
echo "POST ${API_URL}/email/test                 - Send test email"
echo "POST ${API_URL}/email/daily-reminder/trigger - Trigger daily reminders"
echo "POST ${API_URL}/email/welcome              - Send welcome email"
echo "POST ${API_URL}/email/streak-achievement   - Send streak achievement"
echo "POST ${API_URL}/email/weekly-summary       - Send weekly summary"

# Test 5: Example email preference update
echo -e "\n${YELLOW}5. Example: Update email preferences${NC}"
echo "curl -X PUT \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"notifications\": true, \"dailyReminder\": {\"enabled\": true, \"time\": \"20:00\"}}' \\"
echo "  ${API_URL}/email/preferences"

# Test 6: Frontend Settings
echo -e "\n${YELLOW}6. Frontend Settings Page:${NC}"
echo -e "Open ${BLUE}http://localhost:5174/settings${NC} to:"
echo "• Enable/disable daily email reminders"
echo "• Set custom reminder time"
echo "• Save email preferences"

# Test 7: Email Configuration Check
echo -e "\n${YELLOW}7. Email Configuration:${NC}"
echo "Checking .env file for email settings..."

ENV_FILE="../backend/.env"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    if grep -q "EMAIL_USER=" "$ENV_FILE"; then
        email_user=$(grep "EMAIL_USER=" "$ENV_FILE" | tail -1 | cut -d'=' -f2)
        echo -e "📧 Email user: ${BLUE}$email_user${NC}"
    else
        echo -e "${RED}❌ EMAIL_USER not configured${NC}"
    fi
    
    if grep -q "EMAIL_PASS=" "$ENV_FILE"; then
        echo -e "${GREEN}✅ EMAIL_PASS configured${NC}"
    else
        echo -e "${RED}❌ EMAIL_PASS not configured${NC}"
    fi
    
    if grep -q "EMAIL_HOST=" "$ENV_FILE"; then
        email_host=$(grep "EMAIL_HOST=" "$ENV_FILE" | tail -1 | cut -d'=' -f2)
        echo -e "🏠 Email host: ${BLUE}$email_host${NC}"
    else
        echo -e "${RED}❌ EMAIL_HOST not configured${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found in backend directory${NC}"
fi

# Instructions
echo -e "\n${YELLOW}📋 Setup Instructions:${NC}"
echo "1. Set up Gmail App Password (see EMAIL_SETUP_GUIDE.md)"
echo "2. Update backend/.env with your email credentials"
echo "3. Restart the backend server"
echo "4. Test email functionality using the endpoints above"
echo "5. Set your daily reminder time in the Settings page"

echo -e "\n${GREEN}🎉 Demo complete! Check EMAIL_SETUP_GUIDE.md for detailed instructions.${NC}"
