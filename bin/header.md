<div>	
	<h1>Introduction</h2>
	<p>
		t6 is using Https protocols to manage your Objects, Flows and DataPoints, Dashboards and so on.<br />
		This documentation is aiming to give technical overview ; The <a href="https://github.com/mathcoll/t6/wiki">functionnal features are explained in the Wiki.</a>
	</p>
	<p>
		Endpoints allows to manage your own Objects, Flows, Users, and DataPoints using normalized verbs:
	</p>
	<ul>
	<li><strong class="navtype navtype__get">GET</strong> verb is used to retrieve information from t6;</li>
	<li><strong class="navtype navtype__post">POST</strong> verb is used to create a new element;</li>
	<li><strong class="navtype navtype__put">PUT</strong> verb is used to edit an existing elements;</li>
	<li><strong class="navtype navtype__del">DELETE</strong> verb is used to delete existing elements.</li>
	</ul>
	<p>
		All API enpoints support json and optional Http Headers can be provided:<br />
		<span class="label label-primary">Content-Type: application/json</span><br />
		<span class="label label-primary">Accept: application/json</span><br />
	</p>
</div>

<div>	
	<h1>Authentication</h2>
	<p>
		To create and get a JWT Token, you must authenticate yourself on the API by using the dedicated Endpoint.<br />
		Most API endpoint require an Authentication to identify and approve the user request. This is done by adding 
		<span class="label label-primary">Authorization: Bearer <JWTtoken></span> Header to the Http request.
	</p>
</div>

<div>	
	<h1>Quota</h2>
	<p>
		Quota is defined during the registration process. When the limit is reached, an Http error message is sent by the API and the request is not processed:
		<span class="label label-primary">429 Too Many Requests</span>.
	</p>
</div>

<div>	
	<h1>Pagination</h2>
	<p>
		Pagination is using the following parameters:
		<ul>
			<li><b>size</b>: the size parameter allow  to request the number of items you want to retrieve.</li>
			<li><b>page</b>: this page parameter allows to place cursor on the selected page.</li>
		</ul>
		e.g.: <span class="label label-primary">https://api.internetcollaboratif.info/v2.0.1/objects/?page=2&size=20</span><br />
		This will generate the payload listing Objects from resource cursor 21 to 41.
	</p>
	<p>
		Additionnaly, the json payload is containing the following data:
		<ul>
			<li><b>parent</b>: url endpoint of the parent resource.</li>
			<li><b>self</b>: url endpoint of the current resource.</li>
			<li><b>first</b>: url endpoint of the first page/cursor for the current resource.</li>
			<li><b>last</b>: url endpoint of the last page/cursor for the current resource.</li>
			<li><b>prev</b>: url endpoint of the previous page/cursor for the current resource.</li>
			<li><b>next</b>: url endpoint of the next page/cursor for the current resource.</li>
		</ul>
	</p>
</div>

<div>	
	<h1>Http Statuses</h2>
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
</div>

<div>	
	<h1>t6 Architecture</h2>
	<p>
		<img src="https://raw.githubusercontent.com/mathcoll/t6/master/public/img/m/t6.png" class="img-responsive center-block" alt="General-structure"/>
		<br />
		<a href="https://github.com/mathcoll/t6/wiki">More details on t6 features in the Wiki.</a>
	</p>
</div>