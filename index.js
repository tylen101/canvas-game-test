const modalEl = document.getElementById("modalEl")
const canvas = document.querySelector('canvas')
const bigScoreEl = document.getElementById('bigScoreEl')
const context = canvas.getContext('2d')
const highScore = document.getElementById('highScore')
const newHigh = document.getElementById('newHigh')
const startGameBTN = document.getElementById('startGameBTN')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.getElementById('scoreEl')

class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        context.fillStyle = this.color
        context.fill()
    }
}

class Projectile extends Player{
    constructor(x, y, radius, color, velocity){
        super(x, y, radius, color)
        this.velocity = velocity
    } 
    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy extends Projectile{
    constructor(x, y, radius, color, velocity){
        super(x, y, radius, color, velocity)
    }
}

const friction = 0.98
class Particle extends Enemy {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity)
        this.alpha = 1
    }
    draw(){
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01
    }
}

const x = canvas.width/2;
const y = canvas.height/2;



let player = new Player(x, y, 10, 'white')

const projectile = new Projectile(x, y, 5, 'white', {x: 1, y: 1})


let projectiles = []
let enemies = []
let particles = []



function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = 0
    bigScoreEl.innerHTML = 0

}


function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30-5) +5

        let x
        let y 
        if (Math.random() < 0.5) {
         x = Math.random()<0.5 ? 0 - radius : canvas.width + radius
         y = Math.random() * canvas.height
        //  y = Math.random()<0.5 ? 0 - radius : canvas.height+radius
        } else {
            x = Math.random() * canvas.width
            y = Math.random()<0.5 ? 0 - radius : canvas.height - radius
        }
        
        const color = `hsl(${Math.random() * 360},50%,50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 3000)

}

let animationId 
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    context.fillStyle = 'rgba(0,0,0,0.1)'
    context.fillRect(0, 0, canvas.width, canvas.width)
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
        particle.update()
            }
        }) 

    projectiles.forEach((projectile, index) => {
        projectile.update()
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(()=> {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 0.01) {
            cancelAnimationFrame(animationId)
            bigScoreEl.innerHTML = score
            if (score > highScore.innerHTML) {
                newHigh.innerHTML = 'Conrats! New High Score!'
                highScore.innerHTML = score
            } else { newHigh.innerHTML = 'High Score:'}
            modalEl.style.display = 'flex'
        }
        projectiles.forEach((projectile, projectileIndex) => {
           const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

           if (dist - enemy.radius - projectile.radius < 1) {

               {
//explosions and score update
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * Math.random() * 6, y: (Math.random() -0.5) * Math.random() * 6}))
                }
                   if (enemy.radius -10 > 6) {
                    score += 100
                    scoreEl.innerHTML = score
                       gsap.to(enemy, {
                           radius: enemy.radius - 10
                       })
                       setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                       }, 0);
                   } else {
                    score += 250
                    scoreEl.innerHTML = score
                   setTimeout(() => {
                    enemies.splice(index, 1)
                    projectiles.splice(projectileIndex, 1)
                   }, 0);
                  }    
                }
           }
        })
    })

}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - y, event.clientX - x)
    const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5}

    projectiles.push(new Projectile(x, y, 5, 'white', velocity))
})

startGameBTN.addEventListener('click', () => {

    init()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})

