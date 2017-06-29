#!/bin/bash

NAME=${1}
EMAIL=${2}

cat << _EOF_
<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
  <meta http-equiv="Content-Type" content="text/html; charset=us-ascii" style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0" />
  <meta name="viewport" content="width=device-width" style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0" />
  <title>t6 JWT notification</title>
</head>

<body style="-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;background:#efefef;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;height:100%;line-height:1.65;margin:0;padding:0;width:100%!important">
<table style="-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;background:#efefef;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;height:100%;line-height:1.65;margin:0;padding:0;width:100%!important"
  class="body-wrap">
    <tbody>
      <tr style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
      <td style="clear:both!important;display:block!important;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0 auto!important;max-width:580px!important;padding:0" class="container">
          <table style="border-collapse:collapse;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0;width:100%!important">
          <tbody>
              <tr style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
              <td style="background:#337ab7 no-repeat;color:#337ab7;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0" align="center" class="masthead">
                  <img src="https://api.internetcollaboratif.info/img/header_mail.jpg" />
                  <h1 style="color:#fff;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:32px;line-height:1.25;margin:10px!important;margin-bottom:20px;max-width:90%;padding:0;text-transform:uppercase">
                  t6 JWT notification</h1>
                </td>
              </tr>

              <tr style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
              <td style="background:#fff;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:30px 35px" class="content">
                  <h2 style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:28px;line-height:1.25;margin:0;margin-bottom:20px;padding:0">
                  Hi ${NAME},</h2>

                  <p style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.65;margin:0;padding:0">
                  t6 team is pleased to announce the JWT implementation soon, in all t6 platform. You will then require to use JWT token in your sensors to post datapoints to the API.</p>

                  <p style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.65;margin:0;padding:0">
                  Please, click the link below to have a look at the documentation:</p>

                  <table style="border-collapse:collapse;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0;width:100%!important">
                  <tbody>
                      <tr style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
                      <td style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0" align="center">
                          <p style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.65;margin:0;margin-bottom:20px;padding:0">
                          <a href="https://api.internetcollaboratif.info/docs" style="-moz-user-select:none;background-color:#2973ac;background-image:none;border-color:#2e6da4;border-radius:4px;color:#fff;cursor:pointer;display:inline-block;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:1.42857;margin:0;margin-bottom:0;padding:6px 12px;text-align:center;text-decoration:none;vertical-align:middle;white-space:nowrap" class="btn btn-primary">t6 Documentation</a></p>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p style= "font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.65;margin:0;margin-bottom:20px;padding:0">
                  If you want to give your feedback on t6, or if you need any details&support to switch your sensors using JWT, do not hesitate to reply by email.</p>

                  <p style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.65;margin:0;margin-bottom:20px;padding:0">
                  Thank you, and see you soon on t6.</p>

                  <p style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.65;margin:0;margin-bottom:20px;padding:0">
                  <em style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
                  &#8211; Mathieu from t6</em></p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
      <td style="clear:both!important;display:block!important;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0 auto!important;max-width:580px!important;padding:0" class="container">
          <table style="border-collapse:collapse;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0;width:100%!important">
          <tbody>
              <tr style="font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0">
              <td style="background:0 0;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:30px 35px" align="center" class="content footer">
                  <p style="color:#888;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:1.65;margin:0;margin-bottom:0;padding:0;text-align:center">
                  Sent to ${EMAIL} by <a href="https://api.internetcollaboratif.info" style="color:#888;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.65;margin:0;padding:0;text-decoration:none">
                  t6 from internetcollaboratif.info</a></p>

                  <p style="color:#888;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:1.65;margin:0;margin-bottom:0;padding:0;text-align:center">
                  <a href="mailto:mathieu@internetcollaboratif.info" style="color:#888;font-family:'Avenir Next','Helvetica Neue',Helvetica,Helvetica,Arial,sans-serif;font-size:100%;font-weight:700;line-height:1.65;margin:0;padding:0;text-decoration:none">
                  mathieu@internetcollaboratif.info</a></p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
_EOF_