var socket = io.connect()
var friends = document.querySelector('.friends')
var chats = document.querySelector('.chats')

socket.on('err', function(data) {
  console.error(data);
})

socket.on('user', function(data) {
  console.log(data.friends);
  for (var i = 0; i < data.friends.length; i++) {
    console.log(data.friends[i]);
    ui.friends.append(data.friends[i].username)
  }

})

var ui = {
  friends: {
    append: function(user) {
      var friendItem = document.createElement('div')
      friendItem.classList.add('friend-item')
      var avatar = document.createElement('img')
      avatar.width = '64';
      avatar.src = 'https://robohash.org/' + user
      friendItem.appendChild(avatar)
      var caption = document.createElement('p')
      caption.textContent = user
      friendItem.appendChild(caption)
      friends.appendChild(friendItem)
    }
  }
}
