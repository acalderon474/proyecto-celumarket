pipeline {
    agent any

    stages {
        stage('Validar herramientas') {
            steps {
                bat '''
                git --version
                docker version
                docker compose version
                '''
            }
        }

        stage('Validar rama y contenido') {
            steps {
                bat '''
                git branch
                git status
                dir
                '''
            }
        }

        stage('Instalar dependencias y probar API') {
            steps {
                dir('api-productos') {
                    bat '''
                    call npm install
                    call npm test
                    '''
                }
            }
        }

        stage('Instalar dependencias, probar y compilar frontend') {
            steps {
                dir('frontend') {
                    bat '''
                    call npm install
                    call npm test -- --watch=false
                    call npm run build
                    '''
                }
            }
        }

        stage('Construir y levantar contenedores') {
            steps {
                bat '''
                docker compose -p proyecto-celumarket down --remove-orphans
                docker compose -p proyecto-celumarket up --build -d
                '''
            }
        }

        stage('Esperar inicio de servicios') {
            steps {
                bat '''
                powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 25"
                '''
            }
        }

        stage('Pruebas de integración') {
            steps {
                bat '''
                docker compose -p proyecto-celumarket ps

                curl.exe -f http://localhost:3000/api/health
                curl.exe -f http://localhost:8080/api/health
                curl.exe -f http://localhost:8080/api/products

                curl.exe -f http://localhost:8080/home
                curl.exe -f http://localhost:8080/catalog
                curl.exe -f http://localhost:8080/cart
                '''
            }
        }
    }

    post {
        success {
            echo 'Proceso de integración continua finalizado correctamente.'
        }

        failure {
            echo 'El proceso de integración continua falló. Revisar consola de Jenkins.'
            bat '''
            docker compose -p proyecto-celumarket logs --tail=100
            '''
        }
    }
}