var host = location.protocol + "//" + window.location.hostname + (location.port ? ':'+location.port: '');
var products = null;
var currentProductId = -1;
$(document).ready(function() {
  // get all
  $.ajax({
    type: "GET",
    url: host + '/api/product',
    error: onGetProductError,
    dataType: "json",
  }).done(showProducts);

  // when user click on des-key input
  $(document).on('click', '.des-key', function () {
    var parent = $(this).parents('.des-row');
    addSibling(parent);
  });

  // when user click on des-value input
  $(document).on('click', '.des-value', function () {
    var parent = $(this).parents('.des-row');
    addSibling(parent);
  });

  // when user click on add button
  $(document).on('click', '#add-button', function() {
    var name = $('#product-name').val();
    var type = $('#product-type').val();
    var price = $('#product-price').val();
    var data = {
      name: name,
      type: type,
      price: price
    }
    // get detail value
    $('.des-row').each(function() {
      var key = $(this).find('.des-key').val();
      var value = $(this).find('.des-value').val();
      if(key!=='') {
        // if the key is not empty
        data[key] = value;
      }
    });
    console.log(data);
    // send request
    $.ajax({
      type: "POST",
      url: host + '/api/product',
      data: data,
      success: onCreateSuccess,
      error: onCreateError,
      contentType: "application/x-www-form-urlencoded",
      dataType: "json",
    }); // end ajax request
  });

  $(document).on('click', '.item-product', function() {
    var index = $(this).data('index');
    var len = products.length;
    if (index < len) {
      showProductDetails(products[index]);
    }
  });

  $(document).on('click', '#delete-button', function () {
    $('#confirmModal').modal('show');
  });

  $(document).on('click', '#confirm-delete', function () {
    $.ajax({
      type: "DELETE",
      url: host + '/api/product/' + currentProductId,
      success: onDeleteSuccess,
      error: onCreateError,
      dataType: "json",
    }); // end ajax request
  });
}); // end document ready

function onDeleteSuccess() {
  alert("Delete successfully");
  currentProductId = -1;
  location.reload();
}

function onCreateSuccess() {
  alert("created successfully");
  location.reload();
}

function onCreateError(error) {
  console.log(error);
  alert("Opps! Something went wrong.");
  location.reload();
}

function addSibling(obj) {
  if (!obj.data('generated')) {
    // if sibling has not been generated by this element yet
    // mark this element as added new sibling
    obj.data('generated', true);
    obj.after(getDesRowHTML(obj.data('offset')));
  }
  obj.css({opacity: 1});
}

function getDesRowHTML(parentOffset) {
  if(parentOffset > 2) {
    // we only allow 2 nested levels
    return;
  }

  var html = '<!-- sub row lv1 -->\
  <div class="row des-row" data-offset="' + (parentOffset) + '" data-generated="false">\
    <div class="col-xs-4 col-xs-offset-' + (parentOffset) +'">\
      <input class="form-control des-key" name="description" type="text" value="" placeholder="key">\
    </div>\
    <div class="col-xs-'+ (8-parentOffset) + '">\
      <input class="form-control des-value" name="description" type="text" value="" placeholder="value">\
    </div>\
  </div>';
  return html;
}

function onGetProductError(error) {
  alert("Opps! Something went wrong.")
}

// show the list of products
function showProducts(response) {
  // console.log(response);
  if(response.status) {
    var len = response.products.length;
    if(len) {
      // if the length of product list is not 0
      var i = 0;
      products = response.products;
      var list = $('.product-list');
      for(i = 0; i < len; i++) {
        if (products[i].name == '') {
          list.append('<a class="item-product" data-index='+ i +'>No name</a>');
        } else {
          list.append('<a class="item-product" data-index='+ i +'>'+ products[i].name +'</a>');
        }
      }
    } else {
      // if the length of product list is 0
      $('.product-list').html("The current list of products is empty");
    }
  }
}


function showProductDetails(obj) {
  // sorry
  // i do not sanitize user input here
  // XSS can be exploited here
  console.log(obj);
  $('#name-field').html(obj.name);
  $('#type-field').html(obj.type);
  $('#price-field').html(obj.price);
  currentProductId = obj._id;
  var details = obj.detail;
  $('.detail-value').html('');

  for (var key in details) {
    // skip loop if the property is from prototype
    if (!details.hasOwnProperty(key)) continue;
    $('.detail-value').append('<div class="row">\
      <div class="col-md-4 detail-key">'+ key +'</div>\
      <div class="col-md-8">'+ details[key] +'</div>\
      </div>');
  }
}
