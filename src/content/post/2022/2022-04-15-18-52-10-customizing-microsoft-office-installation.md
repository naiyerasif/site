---
slug: "2022/04/15/customizing-microsoft-office-installation"
title: "Customizing Microsoft Office installation"
description: "The default Microsoft Office installer installs a lot of apps on your Windows machine. Learn how you can install only the needed Office apps."
date: 2022-04-15 18:52:10
update: 2022-04-15 18:52:10
type: "post"
category: "note"
---

I've installed the Microsoft Office suite on different machines over the years. But one thing had always bugged me: the default Office installer installs a lot of applications that I never use (looking at you, OneNote and Skype). I wanted a way to cherry-pick only the Office apps that I needed to use and exclude everything else from the installation. It turns out there is a way to accomplish this.

## Download the Office Deployment Tool

The [Office Deployment Tool](https://www.microsoft.com/en-us/download/details.aspx?id=49117) is a command-line tool provided by Microsoft to download and deploy Microsoft Office on a computer. It's mainly targeted at enterprise users but can be used for personal installations as well.

Download the installer (the `exe` file). When launched, it asks for a folder to extract its content. Say, you choose `D://ODT/`. After extraction, you can find a `setup.exe` file in the selected folder. This is the Office Deployment Tool.

## Mounting the Office installation

> This step is needed only if you've downloaded the Office installation as an `img` file. If you have an `iso` file, extract it in a folder (say, `G:`).

Right-click the Office installation `img` file and select **Mount**.

:::figure
![Mounting Office installer](./images/2022-04-15-18-52-10-customizing-microsoft-office-installation-01.png)

Mounting the Office installer image on Windows
:::

This mounts the file as a drive (say `G:`).

:::figure
![Mounted Office installer](./images/2022-04-15-18-52-10-customizing-microsoft-office-installation-02.png)

Office installer mounted as a drive on Windows
:::

## Generate install configuration with the Office Customization Tool

The Office Deployment Tool requires a configuration file that describes which applications from the Office suite need to be installed. You can generate this configuration file using the **Office Customization Tool**.

Open the browser and launch the [Office Customization Tool](https://config.office.com/deploymentsettings). Choose the architecture, the Office version, etc. At the bottom of the **Products and releases** section, you'd find a list of applications that you can toggle for installation. Pick and choose what you want and complete the rest of the configuration.

:::figure
![Selecting Apps with Office Customization Tool](./images/2022-04-15-18-52-10-customizing-microsoft-office-installation-03.png)

Selecting Office applications to install with [Office Customization Tool](https://config.office.com/deploymentsettings)
:::

After you're done with your configuration, hit the **Export** button to download the configuration file. This is an `XML` file. Copy this file in the folder where the Office Deployment Tool was extracted (that's, `D://ODT/`). Open the file in an editor. A sample configuration file for Office Professional Plus would look like this.

```xml {2..3} title="Configuration.xml"
<Configuration ID="fc113a98-bff0-4eda-8928-41de78dcac57">
	<Add OfficeClientEdition="64" SourcePath="G:">
		<Product ID="ProPlus2021Retail" PIDKEY="<product_id_for_activation>">
			<Language ID="en-us" />
			<ExcludeApp ID="Access" />
			<ExcludeApp ID="Lync" />
			<ExcludeApp ID="OneDrive" />
			<ExcludeApp ID="OneNote" />
			<ExcludeApp ID="Publisher" />
			<ExcludeApp ID="Teams" />
		</Product>
	</Add>
</Configuration>
```

Ensure that

- the `SourcePath` points to the location where the Office installation files are available. That'd be `G:` in our case.
- the value of the `PIDKEY` is a valid product id for activating the Office.

## Deploy the Office suite

Open PowerShell as the administrator at the location where the Office Deployment Tool was extracted (that's, `D://ODT/`) and execute the following command.

```sh prompt{1}
./setup.exe /configure ./Configuration.xml
```

This command launches the customized install.

:::figure
![Office installation splashscreen](./images/2022-04-15-18-52-10-customizing-microsoft-office-installation-04.png)

Installing Office with selected applications
:::

And that's how you can do a clean install of the Office suite ensuring you install only what you need.
