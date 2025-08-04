from fastapi import APIRouter, Depends
from models import PCAPData
from auth import get_current_user_id
from utils.fake_data import generate_fake_pcap_data

router = APIRouter()

@router.get("/pcap", response_model=PCAPData)
async def get_pcap_data(user_id: str = Depends(get_current_user_id)):
    """Get sample PCAP analysis data"""
    pcap_data = generate_fake_pcap_data()
    return PCAPData(**pcap_data)

@router.get("/setup")
async def get_setup_guide(user_id: str = Depends(get_current_user_id)):
    """Get lab setup instructions"""
    setup_content = """
# RedRecon Lab Setup Guide

## Prerequisites
- VirtualBox or VMware
- Kali Linux VM
- Target machine (Metasploitable or DVWA)

## Network Configuration
1. Set up an isolated network
2. Configure IP ranges (192.168.100.0/24)
3. Ensure proper routing

## Tools Installation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install nmap nikto dirb gobuster -y

# Install web testing tools
sudo apt install burpsuite sqlmap -y
```

## Target Setup
1. Download Metasploitable 2
2. Configure network settings
3. Start vulnerable services

## Safety Guidelines
- Only test on systems you own
- Use isolated networks
- Keep detailed logs
- Follow responsible disclosure

## Common Commands
```bash
# Network scanning
nmap -sS -O target_ip

# Web enumeration
dirb http://target_ip

# Vulnerability scanning
nikto -h http://target_ip
```

## Reporting
- Document all findings
- Include remediation steps
- Follow professional standards
"""
    
    return {"content": setup_content, "format": "markdown"}