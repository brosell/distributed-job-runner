Todo

BUGS
- getting sessions stuck open sometimes when functional tests fail. Could it happen in real life?


Stories
- as an agent I want to download the test distribution so that I have access to the latest tests.

- as an agent I want to allocate, run and report the results of a test.
- as an agent I want my own admin user to use in order to avoid clashing with another agent using the same user
	- bootstrap users or create admins on demand, etc.
- as an agent I want to specify which category of tests I'm able to run so that, for example, if I'm an IE machine I only get IE jobs to run

- as a stake holder I want a means of beginning a round of testing
	- perhaps through CI or on demand. or both.

- as a stake holder I want to know the pass/fail status of the current or most recent session and its jobs.

- as a sttke holder I want to be able to cancel a currently running test session.

- as the job master I want to be able to get the latest version of the test dlls from somewhere

- as the job master I want to reflect on the test dlls to build a list of tests to run


		

Test Runner
- attribute for defect numbers. Create a regression that exposes a known defect. Only run the test if the jira item is closed


General
- create some functional tests
	X current-session
	- sessions
	X jobs
- pacakge restapi/model/pipeliner
X meta/reloadModel is broken

Model
X make id first property

Library functionality
X async foreach - got library

RestAPI thingie
X support parent/id/child/(id) resources
X facets - using query string parameters
- log details about the request


Model
- archive function
 - push matching items to "model_data_archive.json"
 - option to include archive in queries
X list method to take a query function
- getAt(index)
- simple constraints
- complex validations
