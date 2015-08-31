# timetracker
An easy to use time tracker using data on a SharePoint 2013.

## Considerations
Before we can start deploying and using the plugin, there are some things we must take care for:

* **SharePoint 2013 server**

  To get project and requirement data and to add time tracking records, we need a SharePoint server with the appropriate list  structure and authentication scheme.

* **create a Github organization and an access token**

Before going into details of SharePoint we will install the plug-in first.

## Installation
Open Chrome and head to the menu. Select `More Tools -> Extensions` to open the Google Chrome extension area. Drag and drop the extension file (SPTimeTracker.crx) to the window and have it installed.

Once it is installed add the SharePoint url of the site or page that you want to access. For the Gitgub credentials you should use your user name and the generated access token. 

## Preparing the structure
We assume, that you handle all project management in your SharePoint environment. So you create your projects there, add requirements, create project members and manage project phases. We only must remember the project id and requirement id, if we want to add a repository and issues on Github. To give you an overview the following table depicts the link betweeb SharePoint and Github:

| SharePoint list | Github data   | Relation |
| --------------- |:-------------:| --------:|
| project         | repository    | 1:*      |
| requirement     | issue         | 1:*      |

So when you create a new Github repository, we must somehow add a reference to the SharePoint project list item.
We will do so, by adding the following two references:

* **Project ID → Repository**

  In most cases this is a one-to-one relation, but it could become a one-to-many relation, if we need several repositories for one project. Must be discussed. 

* **Requirements ID → Issue**

  This is most likely a one-to-many relation, since we will have several issues related to one requirement.


The requirement id from SharePoint must be added in the title of each issue as follows:

*[Req-1234] The issue title*

For the repository the project id from SharePoint must be added in the repository’s description field like follows:

*[Pro-1234] The repository description*

Then the Time Tracker plugin could just retrieve the data from Github and correlate it with data from SharePoint. 


## Outlook
In future version, we want to enhance the Google Chrome extension to integrate into the Github page smoothly. 
As soon as you create a new repository it will offer a selection of available projects from SharePoint and then add the reference on its own. Same goes for creating new issues.
