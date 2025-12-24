# buildyourowntrailer.com.au — DNS + Hosting Notes

## DNS host
- Wix (authoritative name servers)
  - ns2.wixdns.net
  - ns3.wixdns.net

## Website hosting
- GitHub Pages
- Apex (@) A records:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- www CNAME:
  - www.buildyourowntrailer.com.au -> toddlonergan.github.io

## Email (planned)
- Provider: TBD (Google Workspace / Microsoft 365 / etc.)
- Addresses:
  - toddlonergan@buildyourowntrailer.com.au (primary mailbox)
  - info@buildyourowntrailer.com.au (alias/shared mailbox)
- DNS records to add in Wix:
  - MX (from provider)
  - SPF (TXT), DKIM (TXT/CNAME), DMARC (TXT)
