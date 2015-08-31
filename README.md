# SPTimeTracker
An easy to use time tracker using data on a SharePoint 2013.

## Considerations
Before we can start deploying and using the plugin, there are some things we must take care for.

### SharePoint 2013 server

To get project and requirement data and to add time tracking records, we need a SharePoint server with the appropriate list  structure and authentication scheme. In SharePoint you must activate basic authentication and make sure to use an SSL encrypted connection. Then add at least three lists: `Projects`, `Requirements` and `Time Records`. 
  
* **Project list (minimum data structure)**

  | Field           | Data type     | Description                   |
  | --------------- |:-------------:| ------------------------------|
  | Id              | int           | The unique project id         |
  | Title           | string        | The title of the project      |

* **Requirement list (minimum data structure)**
 
  | Field           | Data type     | Description                   |
  | --------------- |:-------------:| ------------------------------|
  | Id              | int           | The unique requirement id     |
  | Title           | string        | The title of the requirement  |
  | Project         | lookup        | A reference to the project    |  

* **Time Records list (minimum data structure)**

  | Field           | Data type     | Description                                                            |
  | --------------- |:-------------:| -----------------------------------------------------------------------|
  | Id              | int           | The unique time record id                                              |
  | Duration        | int           | Number of minutes taken for this task                                  |
  | Date            | daten         | The date when the item was created                                     |  
  | Description     | string        | A description of the work that was done                                |
  | Summary         | string        | A summary of the work that was done; could include the Github comments |  
  | Category        | string        | Category like “Customer Meeting”, “Github” or “Documentation”          |
  | Requirement     | lookup        | Reference to the related requirement                                   |  
  | User            | lookup        | Reference to the user who added the item                               |  
  

### Github

Head to [Github](https://github.com) and create a new account. Most likely you will also need an organization so you should create this one as well. Once you did so, head to the *settings* of the account that you will use to commit your code to. Go the the *Personal access tokens* section and create a new access token. This token will be required to authenticate the Google Chrome Extension with Github.


## Installation
Open Chrome and head to the menu. Select `More Tools -> Extensions` to open the Google Chrome extension area. Drag and drop the extension file (SPTimeTracker.crx) to the window and have it installed.

Once it is installed add the SharePoint url of the site or page that you want to access. For the Gitgub credentials you should use your user name and the generated access token. 

## Preparing the structure
We assume that you handle all project management in your SharePoint environment. So create your projects there, add requirements, create project members and manage project phases. We only must remember the project id and requirement id to create references when we want to add a repository and issues on Github. The following table depicts the link between SharePoint and Github:

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

Now the Time Tracker plugin can retrieve the data from Github and correlate it with data from SharePoint. 


## Outlook
In future versions we want to enhance the Google Chrome extension to integrate into the Github page smoothly. 
As soon as you create a new repository it will offer a selection of available projects from SharePoint and then add the reference on its own. Same goes for creating new issues.
