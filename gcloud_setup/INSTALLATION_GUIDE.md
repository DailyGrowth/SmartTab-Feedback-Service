# Google Cloud SDK Installation Guide

## Installation Steps

1. Run the installer:
   - Navigate to the `gcloud_setup` folder
   - Double-click `GoogleCloudSDKInstaller.exe`
   - Follow the installation wizard

2. Installation Options:
   - Choose "Single User" installation
   - Keep all default components selected
   - Allow the installer to create a Start Menu folder

3. Post-Installation Setup:
   - Open PowerShell or Command Prompt
   - Run the following commands:

   ```powershell
   # Initialize gcloud
   gcloud init

   # Authenticate your account
   gcloud auth login

   # Check installation
   gcloud --version
   ```

4. Verify Installation:
   ```powershell
   # List available projects
   gcloud projects list
   ```

## Next Steps After Installation

1. Create a Google Cloud account if you haven't already:
   - Visit: https://console.cloud.google.com
   - Sign up for free tier ($300 credit for 90 days)

2. Set up billing account:
   - Required for creating projects
   - No charges without explicit approval

3. Run the setup script:
   ```powershell
   # Navigate to project directory
   cd "c:/Users/Taibe/CascadeProjects/SmartTab Agent"
   
   # Run setup script
   ./gcloud_setup.sh
   ```

## Common Issues and Solutions

1. If `gcloud` command is not recognized:
   - Close and reopen PowerShell/Command Prompt
   - If still not working, add Google Cloud SDK to PATH manually

2. Authentication issues:
   - Run `gcloud auth login` again
   - Make sure you're using the correct Google account

3. Permission issues:
   - Make sure you have admin rights on your machine
   - Run PowerShell as Administrator if needed

## Support Resources

- Official Documentation: https://cloud.google.com/sdk/docs
- Google Cloud Free Tier: https://cloud.google.com/free
- Troubleshooting: https://cloud.google.com/sdk/docs/troubleshooting
