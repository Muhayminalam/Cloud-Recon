import random
from datetime import datetime
from typing import Dict, List, Any

def generate_fake_nmap_scan(target: str) -> Dict[str, Any]:
    """Generate fake Nmap-style scan results"""
    common_ports = [
        {"port": 22, "service": "ssh", "state": "open", "version": "OpenSSH 8.2"},
        {"port": 80, "service": "http", "state": "open", "version": "Apache 2.4.41"},
        {"port": 443, "service": "https", "state": "open", "version": "Apache 2.4.41"},
        {"port": 3306, "service": "mysql", "state": "closed", "version": ""},
        {"port": 8080, "service": "http-proxy", "state": "filtered", "version": ""},
        {"port": 21, "service": "ftp", "state": "open", "version": "vsftpd 3.0.3"},
        {"port": 25, "service": "smtp", "state": "open", "version": "Postfix"},
        {"port": 53, "service": "dns", "state": "open", "version": "ISC BIND 9.16"}
    ]
    
    # Randomly select 3-6 ports
    selected_ports = random.sample(common_ports, random.randint(3, 6))
    
    os_options = [
        {"name": "Linux", "version": "Ubuntu 20.04", "accuracy": "95%"},
        {"name": "Linux", "version": "CentOS 8", "accuracy": "92%"},
        {"name": "Windows", "version": "Windows Server 2019", "accuracy": "88%"},
        {"name": "Linux", "version": "Debian 11", "accuracy": "90%"}
    ]
    
    services = []
    for port in selected_ports:
        if port["state"] == "open":
            services.append({
                "port": port["port"],
                "service": port["service"],
                "product": port["version"],
                "extrainfo": f"protocol {random.choice(['2.0', '1.1', '1.0'])}"
            })
    
    return {
        "target": target,
        "status": "completed",
        "ports": selected_ports,
        "os_info": random.choice(os_options),
        "services": services,
        "scan_time": datetime.utcnow(),
        "host_status": "up",
        "latency": f"{random.uniform(0.1, 2.5):.2f}ms"
    }

def generate_fake_payload_response(payload_type: str, payload: str, target_url: str) -> Dict[str, Any]:
    """Generate fake payload testing results"""
    success_rate = {
        "xss": 0.7,
        "sqli": 0.6,
        "csrf": 0.5,
        "lfi": 0.4,
        "rfi": 0.3
    }
    
    is_successful = random.random() < success_rate.get(payload_type, 0.5)
    
    base_response = {
        "status_code": 200 if is_successful else random.choice([400, 403, 500]),
        "response_time": f"{random.uniform(0.1, 3.0):.2f}s",
        "content_length": random.randint(500, 5000),
        "headers": {
            "Content-Type": "text/html; charset=utf-8",
            "Server": random.choice(["Apache/2.4.41", "nginx/1.18.0", "IIS/10.0"]),
            "X-Powered-By": random.choice(["PHP/7.4.3", "ASP.NET", "Express"])
        }
    }
    
    if payload_type == "xss":
        if is_successful:
            base_response.update({
                "vulnerability_detected": True,
                "evidence": f"Script executed: {payload[:50]}...",
                "risk_level": "high",
                "recommendation": "Implement input validation and output encoding"
            })
        else:
            base_response.update({
                "vulnerability_detected": False,
                "evidence": "Script was filtered or encoded",
                "protection": "WAF or input filtering detected"
            })
    
    elif payload_type == "sqli":
        if is_successful:
            base_response.update({
                "vulnerability_detected": True,
                "evidence": "Database error revealed",
                "database_type": random.choice(["MySQL", "PostgreSQL", "MSSQL"]),
                "risk_level": "critical",
                "recommendation": "Use parameterized queries"
            })
        else:
            base_response.update({
                "vulnerability_detected": False,
                "evidence": "No database errors detected",
                "protection": "Parameterized queries or WAF protection"
            })
    
    return base_response

def get_sample_cves() -> List[Dict[str, Any]]:
    """Get sample CVE data"""
    return [
        {
            "_id": "CVE-2024-1234",
            "description": "Remote code execution vulnerability in Apache HTTP Server",
            "severity": "critical",
            "tags": ["rce", "apache", "web"],
            "reference": "https://nvd.nist.gov/vuln/detail/CVE-2024-1234",
            "published_date": "2024-01-15"
        },
        {
            "_id": "CVE-2024-5678",
            "description": "SQL injection vulnerability in WordPress plugin",
            "severity": "high",
            "tags": ["sqli", "wordpress", "cms"],
            "reference": "https://nvd.nist.gov/vuln/detail/CVE-2024-5678",
            "published_date": "2024-02-20"
        },
        {
            "_id": "CVE-2024-9876",
            "description": "Cross-site scripting (XSS) in popular JavaScript framework",
            "severity": "medium",
            "tags": ["xss", "javascript", "framework"],
            "reference": "https://nvd.nist.gov/vuln/detail/CVE-2024-9876",
            "published_date": "2024-03-10"
        },
        {
            "_id": "CVE-2024-4321",
            "description": "Privilege escalation in Linux kernel",
            "severity": "high",
            "tags": ["privilege-escalation", "linux", "kernel"],
            "reference": "https://nvd.nist.gov/vuln/detail/CVE-2024-4321",
            "published_date": "2024-01-28"
        },
        {
            "_id": "CVE-2024-8765",
            "description": "Buffer overflow in OpenSSL library",
            "severity": "critical",
            "tags": ["buffer-overflow", "openssl", "cryptography"],
            "reference": "https://nvd.nist.gov/vuln/detail/CVE-2024-8765",
            "published_date": "2024-03-05"
        }
    ]

def generate_fake_pcap_data() -> Dict[str, Any]:
    """Generate fake PCAP analysis data"""
    protocols = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "ICMP", "ARP"]
    protocol_breakdown = {}
    total_packets = random.randint(1000, 10000)
    
    for protocol in protocols:
        protocol_breakdown[protocol] = random.randint(10, total_packets // 3)
    
    # Normalize to match total
    actual_total = sum(protocol_breakdown.values())
    for protocol in protocol_breakdown:
        protocol_breakdown[protocol] = int(protocol_breakdown[protocol] * total_packets / actual_total)
    
    sample_packets = [
        "14:23:45.123456 192.168.1.100.54321 > 192.168.1.1.80: Flags [S], seq 123456789",
        "14:23:45.125678 192.168.1.1.80 > 192.168.1.100.54321: Flags [S.], seq 987654321, ack 123456790",
        "14:23:45.126789 192.168.1.100.54321 > 192.168.1.1.80: Flags [.], ack 987654322",
        "14:23:45.130456 192.168.1.100.54321 > 192.168.1.1.80: Flags [P.], seq 123456790:123456890",
        "14:23:45.135789 192.168.1.1.80 > 192.168.1.100.54321: Flags [.], ack 123456890"
    ]
    
    return {
        "filename": f"capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pcap",
        "size": random.randint(1024, 1048576),  # 1KB to 1MB
        "packets": total_packets,
        "protocol_breakdown": protocol_breakdown,
        "sample_data": "\n".join(sample_packets),
        "duration": f"{random.randint(30, 3600)}s",
        "capture_interface": random.choice(["eth0", "wlan0", "en0"])
    }