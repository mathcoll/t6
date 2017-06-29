<h2>Introduction</h2>
<p>
	t6 is using either Http or Https protocols to manage your Objects, Flows and Data Points.
</p>
<p>
	Endpoints allows to manage your own Objects, Flows, Users, and Data Points using normalized verbs:
</p>
<ul>
<li><strong class="type type__get">GET</strong> verb is used to retrieve information from t6 datastore;</li>
<li><strong class="type type__post">POST</strong> verb is used to create a new element;</li>
<li><strong class="type type__put">PUT</strong> verb is used to edit an existing elements;</li>
<li><strong class="type type__delete">DELETE</strong> verb is used to delete existing elements.</li>
</ul>
<p>
	All API enpoints support json and optional Http Headers can be provided:<br />
	<span class="label label-primary">Content-Type: application/json</span><br />
	<span class="label label-primary">Accept: application/json</span><br />
</p>

<h2>Authentication</h2>
<p>
	To create and get a JWT Token, you must authenticate yourself on the API by using the dedicated Endpoint.<br />
	Most API endpoint require an Authentication to identify and approve the user request. This is done by adding 
	<span class="label label-primary">Authorization: Bearer <JWTtoken></span> Header to the Http request.
</p>

<h2>Quota</h2>
<p>
	Quota is defined during the registration process. When the limit is reached, an Http error message is sent by the API and the request is not processed:
	<span class="label label-primary">429 Too Many Requests</span>.
</p>

<h2>Http Statuses</h2>
<p>
	<ul>
		<li><span class="type label label-primary">200 Success</span> Server successfully understood the transaction.</li>
    	<li><span class="type label label-primary">201 Created</span> The Creation of a new resource was successful.</li>
    	<li><span class="type label label-primary">400 Bad Request</span> Require a Bearer Authentication.</li>
    	<li><span class="type label label-primary">401 Not Authorized</span> Require a Bearer JWTtoken Authentication.</li>
    	<li><span class="type label label-primary">403 Forbidden</span> JWTtoken used in transaction is not valid. Check your token and/or permission.</li>
    	<li><span class="type label label-primary">404 Not Found</span> We couldn't find the resource you are trying to access.</li>
    	<li><span class="type label label-primary">405 Method Not Allowed</span> API endpoint does not accept the method used.</li>
    	<li><span class="type label label-primary">412 Precondition Failed</span> Request input does not match prerequisites, and so, failed.</li>
    	<li><span class="type label label-primary">429 Too Many Requests</span> Request failed due to quota overlimit.</li>
    </ul>
</p>

<h2>t6 Architechture</h2>
<p>
	<img src="https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-General-structure.png" class="img-responsive center-block" alt="General-structure"/>
</p>