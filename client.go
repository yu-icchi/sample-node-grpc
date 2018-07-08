package main

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/teris-io/shortid"
	pb "github.com/yu-ichiko/sample-node-grpc/proto"
	"google.golang.org/grpc"
)

func main() {
	conn, err := grpc.Dial("localhost:50051", grpc.WithInsecure())
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	client := pb.NewPacketClient(conn)

	go ping(client)

	reqID, _ := shortid.Generate()
	req := &pb.ReqStream{
		Version: 1,
		Topic:   "test-topic",
		Event:   "join",
		ReqId:   reqID,
		ConnId:  "conn_id",
		Data:    []byte("request message"),
	}
	stream, err := client.Stream(context.Background(), req)
	if err != nil {
		log.Fatal(err)
	}
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(res.Version)
		fmt.Println(res.Topic)
		fmt.Println(res.Event)
		fmt.Println(res.ReqId)
		fmt.Println(res.ConnId)
		fmt.Println(res.Cmd)
		fmt.Println(string(res.Data))
		fmt.Println("--------")
	}
}

func ping(client pb.PacketClient) {
	stream, err := client.Heartbeat(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	done := make(chan struct{})

	go receive(done, stream)

	data := []string{"A", "B", "C"}
	err = send(data, stream)
	if err != nil {
		log.Fatal(err)
	}
	<-done
}

func send(data []string, stream pb.Packet_HeartbeatClient) error {
	for {
		ping := "ping"
		err := stream.Send(&pb.Req{Msg: ping})
		if err != nil {
			return err
		}
	}
	err := stream.CloseSend()
	if err != nil {
		return err
	}
	return nil
}

func receive(done chan struct{}, stream pb.Packet_HeartbeatClient) {
	for {
		resp, err := stream.Recv()
		if err == io.EOF {
			close(done)
			return
		}
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(resp)
	}
}
