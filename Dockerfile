FROM dxccna/node_wsqc_base:9.5.0

WORKDIR /src

ENV STACKATO_SERVICES "{\"wsqc-rabbitmq3\": {\"name\":\"guest\",\"hostname\":\"rabbitwsqc\",\"host\":\"rabbitwsqc\",\"port\":5672,\"vhost\":\"wsqc\",\"username\":\"guest\",\"user\":\"guest\",\"password\":\"password\",\"pass\":\"password\",\"uri\":\"amqp://guest:password@rabbitwsqc:5672/wsqc\",\"dashboard_url\":\"http://172.16.1.31:30007\"}}"

ENV CRAWL_LEVEL "1"
ENV CRAWLER_SERVICE_URL "http://wsqccrawler:8055/crawlreport?"
ENV WEBSITE_SEPARATER ","
ENV REPORT_TABLE_DATA_LIMIT "11"
ENV SOCKET_IO_URL "http://localhost:8081"
ENV CACHE_POPULAR_REPORT_URL "http://wsqcservicemanagement:8088/read-popular-websites"
ENV CACHE_RETRIEVE_REPORT_URL "http://wsqcreports:8066/websitequalitychecker"
ENV DATASERVICE_UPDATE_REPORT_URL "http://wsqcreports:8066/dataservice/update"
ENV DATASERVICE_CONNECTION_TEST_URL "http://wsqcreports:8066/dataservice/check-Availability"
ENV CRAWLER_SERVICE_CONNECTION_TEST_URL "http://wsqccrawlerservice:8055/crawlerhealthcheck"
ENV CACHE_CONNECTION_TEST_URL "http://wsqcservicemanagement:8088/check-Availability"
ENV SERVICE_TIMEOUT_THRESHOLD "400000"
ENV ROUTER_SERVICE_URL "http://wsqcservicemanagement:8088/get-next-action"
ENV CRAWLER_HEALTH_CHECK_URL "/crawler-health-check"
ENV NODE_HEALTH_CHECK_URL "/node-health-check"
ENV QUEUE_HEALTH_CHECK_URL "/queue-health-check"
ENV SERVICE_RETRY_THRESHOLD "30000"
ENV REQUEST_VOLUME_THRESHOLD "0"
ENV SLEEP_WINDOW_TIME "300000"
ENV RABBITMQ_SERVICE "wsqc-rabbitmq3"
ENV CRAWLER_QUEUE "DATA_SERVICE_QUEUE"
ENV REPORT_QUEUE "REPORT_DATA_QUEUE"
ENV NODE_SERVICE_CONNECTION_TEST_URL "http://wsqccommunications:3001/listener-health-check"
ENV QUEUE_SERVICE_CONNECTION_TEST_URL "http://rabbitwsqc:15672/#/queues/wsqc/TEST_QUEUE"
ENV EUREKA_SERVER_HOST "eurekaservicemanagement"
ENV EUREKA_SERVICE_PATH  "/eureka/apps"
ENV EUREKA_SERVER_PORT "8077"

COPY server.js /src/server.js
COPY WebContent /src/WebContent

COPY first_run.sh /src/first_run.sh

RUN chmod -R 775 /src/

#ENTRYPOINT ["/src/first_run.sh"]
CMD ["npm", "start"]

EXPOSE 8081