import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error ('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error ('Usuário não encontrado')
      }

      this.entries = [ user,  ...this.entries]
      this.update()
      this.save()
      
    } catch (error) {
      alert(error)
    }

  }

  delete(user) {
    const filteredEntries = this.entries.filter((entry) => {
      if (entry.login !== user.login) {
        return true
      }
    })

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('tbody')

    this.update()
    this.onAdd()
  }

  onAdd() {
    const searchInput = this.root.querySelector('.search input')

    searchInput.addEventListener('keydown', event => {
      if(event.keyCode === 13) {
        this.add(searchInput.value)
      }
    })

    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()


    
    this.entries.forEach(user => {
      const row = this.createRow()
      // console.log(user)

      row.querySelector('.user img').src = `http://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `http://github.com/${user.login}`
      row.querySelector('.user p').innerHTML = user.name
      row.querySelector('.user span').innerHTML = `/${user.login}`
      row.querySelector('.repositories').innerHTML = user.public_repos
      row.querySelector('.followers').innerHTML = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOkToRemove = confirm('Tem certeza que deseja remover esse registro')

        if (isOkToRemove) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })



  }

  createRow(){
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td><button class="remove">Remover</button></td>
    `

    return tr
  }
  
  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }

}