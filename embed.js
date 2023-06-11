var iframe = document.getElementById('JSWidget'),
    iframedoc = iframe.contentDocument || iframe.contentWindow.document;

iframedoc.body.innerHTML = 'Hello world';