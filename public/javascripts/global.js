var socket = io.connect()
var user = {};

socket.on('reconnect', function(attemptNumber) {
  logger.flush()
})

socket.on('err', function(data) {
  logger.error(data);
})

socket.on('user', function(data) {
  user = data
  socket.emit('message/get_all')
  socket.emit('join', data)
})

socket.on('message/receive', function(data) {
  logger.log(data, data._author)
  users.typing(data._author, false)
  window.scrollTo(0, document.body.scrollHeight)
})

socket.on('message/typing', function(data) {
  users.typing(data, true)
  window.scrollTo(0, document.body.scrollHeight)
})

socket.on('message/notification', function(data) {
  logger.notification(data)
  window.scrollTo(0, document.body.scrollHeight)
})

socket.on('users/append', function(data) {
  users.append(data)
})
socket.on('users/remove', function(data) {
  users.remove(data)
})

var input = document.querySelector('.input')
var innerInput = document.createElement('input')
innerInput.placeholder = 'Type message and press enter'
innerInput.addEventListener('keypress', function(e) {
  socket.emit('message/typing', user)
  if (e.keyCode == 13 && innerInput.value != '') {
    socket.emit('message/send', {
      user: user,
      message: innerInput.value
    })
    innerInput.value = ''
  }
})
input.appendChild(innerInput)



var loggerWrapper = document.querySelector('.logger')
var logger = {
  log: function(msg, user) {
    if(!user || !msg) return
    // message
    var message = document.createElement('div')
    message.classList.add('message')

    // context
    var context = document.createElement('div')
    context.classList.add('context')

    // user
    var username = document.createElement('span')
    username.classList.add('user')
    username.style.color = user.color
    username.textContent = user.username
    context.appendChild(username)
    message.appendChild(context)

    // date
    var date = document.createElement('span')
    date.classList.add('date')
    date.textContent = new Date(msg.date).toLocaleString('en-US')
    context.appendChild(date)

    // content
    var content = document.createElement('div')
    content.classList.add('content')
    content.textContent = msg.content
    message.appendChild(content)
    loggerWrapper.appendChild(message)
  },
  error: function(msg, user) {
    var notification = document.createElement('div')
    notification.classList.add('notification')
    notification.textContent = msg
    loggerWrapper.appendChild(notification)
  },
  notification: function(msg) {
    var notification = document.createElement('div')
    notification.classList.add('notification')
    notification.textContent = msg
    loggerWrapper.appendChild(notification)
  },
  flush: function() {
    loggerWrapper.innerHTML = ''
  }
}

var userWrapper = document.querySelector('.users')
var users = {
  append: function(user) {
    if(!document.getElementById(user._id)) {
      var avatar = document.createElement('div')
      avatar.id = user._id
      avatar.classList.add('user-item')
      avatar.style.color = user.color
      avatar.textContent = user.username
      userWrapper.appendChild(avatar)
    }
  },
  typing: function(user, boolean) {
    var avatar = document.getElementById(user._id)
    if (!avatar) return
    if (boolean == true) {
      avatar.classList.add('typing')
    } else {
      avatar.classList.remove('typing')
    }
  },
  remove: function(user) {
    var avatar = document.getElementById(user._id)
    if (avatar) userWrapper.removeChild(avatar)
  }
}
