package main

import (
	"fmt"
	"io"
	"log"
	"net"

	"time"

	pb "github.com/yu-ichiko/sample-node-grpc/proto"
	"google.golang.org/grpc"
)

type server struct{}

var _ pb.PacketServer = (*server)(nil)

func (s *server) Stream(req *pb.ReqStream, stream pb.Packet_StreamServer) error {
	fmt.Println(req)

	messages := []string{"A", "B", "C"}
	for _, msg := range messages {
		resp := &pb.ResStream{
			ConnId:  req.ConnId,
			ReqId:   req.ReqId,
			Event:   req.Event,
			Topic:   req.Topic,
			Version: req.Version,
			Cmd:     pb.ResStream_SEND,
			Data:    []byte(msg),
		}
		if err := stream.Send(resp); err != nil {
			return err
		}
		time.Sleep(time.Second)
	}
	return nil
}

func (s *server) Heartbeat(stream pb.Packet_HeartbeatServer) error {
	for {
		in, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		resp := &pb.Res{
			Msg: in.Msg,
		}
		if err := stream.Send(resp); err != nil {
			return err
		}
	}
}

func main() {
	lis, err := net.Listen("tcp", "localhost:50051")
	if err != nil {
		log.Fatal(err)
	}

	s := grpc.NewServer()
	pb.RegisterPacketServer(s, new(server))
	if err := s.Serve(lis); err != nil {
		log.Fatal(err)
	}
}
