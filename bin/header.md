<div class="article-content">
	<div class="article-text">
		<div>
			<h1 class="color-primary font-weight-bold">Introduction</h1>
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
			<h1 class="color-primary font-weight-bold">Authentication</h1>
			<p>
				To create and get a JWT Token, you must authenticate yourself on the API by using the dedicated Endpoint.<br />
				Most API endpoint require an Authentication to identify and approve the user request. This is done by adding 
				<span class="label label-primary">Authorization: Bearer <JWTtoken></span> Header to the Http request.
			</p>
		</div>
		<div>	
			<h1 class="color-primary font-weight-bold">Quota</h1>
			<p>
				Quota is defined during the registration process. When the limit is reached, an Http error message is sent by the API and the request is not processed:
				<span class="label label-primary">429 Too Many Requests</span>.
			</p>
		</div>
		<div>	
			<h1 class="color-primary font-weight-bold">Pagination</h1>
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
			<h1 class="color-primary font-weight-bold">Http Success Statuses</h1>
			<table>
				<thead>
					<tr>
						<th class="c1">Status</th>
						<th class="c2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="code">200</td>
						<td>
							<p>Server successfully understood the request</p>
						</td>
					</tr>
					<tr>
						<td class="code">201</td>
						<td>
							<p>Creation of a new resource was successful</p>
						</td>
					</tr>
					<tr>
						<td class="code">202</td>
						<td>
							<p>Server successfully understood the request, it will be done asynchroneously</p>
						</td>
					</tr>
				</tbody>
			</table>
			<h1 class="color-primary font-weight-bold">Http Error Statuses</h1>
			<table>
				<thead>
					<tr>
						<th class="c1">Status</th>
						<th class="c2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="code">400</td>
						<td>
							<p>Bad Request, require a Bearer Authentication or revision is incorrect</p>
						</td>
					</tr>
					<tr>
						<td class="code">401</td>
						<td>
							<p>Require a Bearer Authentication</p>
						</td>
					</tr>
					<tr>
						<td class="code">403</td>
						<td>
							<p>Forbidden Token used in transaction is not valid - check your token and/or
							permission</p>
						</td>
					</tr>
					<tr>
						<td class="code">404</td>
						<td>
							<p>Not Found We couldn't find the resource you are trying to access</p>
						</td>
					</tr>
					<tr>
						<td class="code">405</td>
						<td>
							<p>Method Not Allowed ; API endpoint does not accept the method used</p>
						</td>
					</tr>
					<tr>
						<td class="code">409</td>
						<td>
							<p>Conflict</p>
						</td>
					</tr>
					<tr>
						<td class="code">429</td>
						<td>
							<p>Too Many Requests</p>
						</td>
					</tr>
					<tr>
						<td class="code">500</td>
						<td>
							<p>Internal Server Error</p>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div>	
			<h1 class="color-primary font-weight-bold">t6 Architecture</h1>
			<p>
				<img src="//raw.githubusercontent.com/mathcoll/t6/master/public/img/m/t6.png" class="img-responsive center-block" alt="General-structure"/>
				<br />
				<a href="//www.internetcollaboratif.info/features">More details on t6 features in the Wiki.</a>
			</p>
		</div>
	</div>
</div>