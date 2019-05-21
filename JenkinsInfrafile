node
{
  try {
   
    stage('Pull from SCM') {
      checkout scm
	  
    }
    stage('Test and Build app') {
      sh "git clean -fdx"
	  
    }
    
    stage ('Package Image') {
        sh '''
		    
	    echo "JenkinsWorkspace = ${WORKSPACE}"
            echo "PATH = ${PATH}"
            echo "M2_HOME = ${M2_HOME}"
        '''
		
        }
    
	stage ('Package Image to Docker Hub') {
	     env.STACKATO_FILESYSTEM='${WORKSPACE}'
		 env.DOCKER_CONTAINER_NAME='wsqcuserinterface'
		      //env.HTTP_PROXY_URL = 'http://web-proxy.cce.hp.com'
		      //env.HTTP_PROXY_PORT = '8080'		
		
	}
	
    stage('Bring up Container in Docker swarm (Testing)') {
      echo "creating docker container..."
	
		withDockerServer([uri:'']) {
		docker.withRegistry('https://dxcnca-docker-local.jfrog.io', 'admin-jfrogCloud-docker') {
        	def customImage = docker.build("dxcnca-docker-local.jfrog.io/wsqcuserinterface:latest")
        	/* Push the container to the custom Registry */
        	customImage.push()
		    
			//sh 'docker login dxcnca-docker-local.jfrog.io -u admin -p X60j0i1OVC'
			sh 'docker pull dxcnca-docker-local.jfrog.io/wsqcuserinterface:latest'
			sh 'docker stop wsqcuserinterface'
			//sh 'docker rm -f wsqcuserinterface'
			//sh 'docker run -d -p 9081:8081 --net=wsqc-net --name wsqcuserinterface dxcnca-docker-local.jfrog.io/wsqcuserinterface:latest'
			
			sh """
				if [ "(docker ps -qa -f name=${DOCKER_CONTAINER_NAME})" ]; then
					# cleanup
					docker rm -f ${DOCKER_CONTAINER_NAME}
				    # run your container
				    docker run -d -p 9081:8081 --net=wsqc-net --name wsqcuserinterface dxcnca-docker-local.jfrog.io/wsqcuserinterface:latest
				fi
				""" 

	    }
	}
    }
   stage('Bring up Container in AWS environment') {
      echo "Bringing up Container in AWS environment ... "
	  sh 'sleep 18'
    }

   stage('Bring up Container in Azure environment') {
      echo "Bringing up Container in Azure environment ... "
	  sh 'sleep 12'
   }
	  
   stage('Bring up Container in Kubernetes (Azure)') {
      echo "Bringing up Container in Azure environment ... "
	  sh 'sleep 10'
    }	 
	
  } finally {
    stage('Bring up Container in Azure environment') {
      echo "Bringing up Container in Azure environment ... "
	  sh 'sleep 80'
    }
  }
}
