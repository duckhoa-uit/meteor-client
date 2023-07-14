import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import ws from "isomorphic-ws";
import SimpleDDP, { simpleDDPOptions } from "simpleddp";
import { simpleDDPLogin } from "simpleddp-plugin-login";



import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";



import { Icons } from "./icons";
import LoadingDots from "./loading-dots";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { useToast } from "./ui/use-toast";


type ServerConnectionProps = {}
export type ServerConnectionRef = {
  Meteor: SimpleDDP | null
}

const authenticationTypes = [
  { name: "none", description: "No auth" },
  { name: "username", description: "User" },
  { name: "email", description: "Email" },
]

type ConnectionState = "connecting" | "connected" | "disconnected" | "error"
const connectionLabels: Record<ConnectionState, string> = {
  connecting: "Connecting",
  connected: "Connected",
  disconnected: "Connect",
  error: "Error",
}

const ServerConnection = forwardRef<ServerConnectionRef, ServerConnectionProps>(
  ({}, ref) => {
    const [connectionState, setConnectionState] =
      useState<ConnectionState>("disconnected")
    const [openDisconnectDialog, setOpenDisconnectDialog] = useState(false)

    const { toast } = useToast()

    const meteorRef = useRef<SimpleDDP | null>(null)
    const meteorConnected = useMemo(
      () => connectionState === "connected",
      [connectionState]
    )

    const [serverConnection, setServerConnection] = useState<{
      endpoint: string
      reconnectInterval: number
      maxTimeout: number
      autoReconnect: boolean
    }>({
      endpoint: "",
      reconnectInterval: 5000,
      maxTimeout: 7000,
      autoReconnect: false,
    })

    type AuthType = "none" | "username" | "email"
    const [authentication, setAuthentication] = useState<{
      type: AuthType
      userOrEmail: string | null
      password: string | null
    }>({
      type: "none",
      userOrEmail: null,
      password: null,
    })

    const [showDialog, setShowDialog] = useState(false)
    const toggleDialog = () => setShowDialog(!showDialog)

    useImperativeHandle(ref, () => {
      return {
        Meteor: meteorRef.current,
      }
    })

    const initializeListeners = () => {
      if (meteorRef.current) {
        // Initialize listeners logic
        meteorRef.current.on("connected", async () => {
          toast({ title: `Connected to ${serverConnection.endpoint}` })

          if (authentication.type !== "none") {
            let user = {}
            if (authentication.type === "username") {
              user = { username: authentication.userOrEmail }
            } else {
              user = { email: authentication.userOrEmail }
            }
            try {
              await meteorRef.current?.login({
                user,
                password: authentication.password,
              })
              setConnectionState("connected")
            } catch (error) {
              console.error("error authentication: ", error)
              meteorRef.current?.disconnect()
              // TODO: show alert
              // this.$alert.showAlertSimple("error", error.reason)
            }
          } else {
            console.warn("Connected without Authentication")
            setConnectionState("connected")
          }
        })

        meteorRef.current.on("disconnected", () => {
          meteorRef.current?.stopChangeListeners()

          setConnectionState("disconnected")
        })

        meteorRef.current.on("error", (e: any) => {
          // global errors from server
          console.error("Has occurred an error: ", e)
          setConnectionState("error")
        })

        meteorRef.current.on("login", (m: any) => {
          console.log("User logged in as: ", m)
        })

        meteorRef.current.on("logout", () => {
          console.log("User logged out")
        })

        meteorRef.current.on("loginSessionLost", (id: any) => {
          console.error(
            `User ${id} lost connection to server, will auto resume by default with token`
          )
        })

        meteorRef.current.on("loginResume", (m: any) => {
          console.log("User resumed (logged in by token)", m)
        })

        meteorRef.current.on("loginResumeFailed", (m: any) => {
          console.error(
            "Failed to resume authorization with token after reconnection ",
            m
          )
        })
      }
    }

    const validateConnection = () => {
      // Validate connection logic
      let isCorrect = true
      if (!serverConnection.endpoint) {
        toast({
          title: "Warning",
          description: "Please fill all data connection (host, etc)",
          variant: "destructive",
        })
        isCorrect = false
      }
      if (
        !new RegExp(/\b(?:wss|ws)s?:\/\/\S*[^\s."]/gm).test(
          serverConnection.endpoint
        )
      ) {
        toast({
          title: "Warning",
          description: "Please enter valid websocket URL",
          variant: "destructive",
        })
        isCorrect = false
      }

      if (
        authentication.type !== "none" &&
        (!authentication.userOrEmail || !authentication.password)
      ) {
        toast({
          title: "Warning",
          description: "Please enter your credentials",
          variant: "destructive",
        })
        isCorrect = false
      }

      return isCorrect
    }

    const connect = () => {
      if (connectionState === "disconnected" || connectionState === "error") {
        // Connect logic
        if (validateConnection()) {
          setConnectionState("connecting")

          const opts: simpleDDPOptions = {
            endpoint: serverConnection.endpoint,
            SocketConstructor: ws,
            reconnectInterval: serverConnection.reconnectInterval,
            maxTimeout: serverConnection.maxTimeout,
            autoReconnect: false,
            // autoReconnect: serverConnection.autoReconnect,
            autoConnect: false,
          }
          meteorRef.current = new SimpleDDP(opts, [simpleDDPLogin])
          initializeListeners()

          meteorRef.current.connect()
        }
      } else {
        disconnectFromServer()
      }
    }

    const handleDisconnect = () => {
      disconnectFromServer()
      setOpenDisconnectDialog(false)
    }
    const disconnectFromServer = () => {
      // Disconnect from server logic
      meteorRef.current?.logout()
      meteorRef.current?.disconnect()
    }

    return (
      <div className="auth-wrapper flex px-3 pt-1">
        <Input
          value={serverConnection.endpoint}
          onChange={(e) =>
            setServerConnection({
              ...serverConnection,
              endpoint: e.target.value,
            })
          }
          placeholder="Endpoint"
          disabled={meteorConnected}
        />
        <div className="">
          <Select
            onValueChange={(value) =>
              setAuthentication({
                ...authentication,
                type: value as AuthType,
              })
            }
            disabled={meteorConnected}
            defaultValue={authentication.type}
          >
            <SelectTrigger className="min-w-[100px]">
              <SelectValue placeholder="Port" />
            </SelectTrigger>
            <SelectContent>
              {authenticationTypes.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {authentication.type !== "none" && (
          <Input
            type="text"
            value={authentication.userOrEmail ?? ""}
            onChange={(e) =>
              setAuthentication({
                ...authentication,
                userOrEmail: e.target.value,
              })
            }
            placeholder="User/Email"
            disabled={meteorConnected}
          />
        )}
        {authentication.type !== "none" && (
          <Input
            type={"password"}
            value={authentication.password ?? ""}
            onChange={(e) =>
              setAuthentication({
                ...authentication,
                password: e.target.value,
              })
            }
            placeholder="Password"
            disabled={meteorConnected}
          />
        )}
        {connectionState === "connected" ? (
          <AlertDialog
            open={openDisconnectDialog}
            onOpenChange={setOpenDisconnectDialog}
          >
            <AlertDialogTrigger asChild>
              <Button className="ml-2">
                <Icons.check className="mr-2 h-5 w-5" />
                {connectionLabels["connected"]}{" "}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will disconnect from server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect}>
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={connect}
            disabled={connectionState === "connecting"}
            className="ml-2"
          >
            {connectionState === "connecting" && (
              <span className="mr-2 self-baseline">
                <LoadingDots style="big" />
              </span>
            )}
            {connectionLabels[connectionState]}
          </Button>
        )}

        <Dialog open={showDialog} onOpenChange={toggleDialog}>
          <DialogTrigger asChild>
            <Button variant={"outline"} className="ml-2 h-10">
              <Icons.settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced options</DialogTitle>
            </DialogHeader>

            <form className="flex flex-col">
              <div className="mt-3 grid w-full items-center gap-1.5">
                <Label htmlFor="email">Reconnect interval</Label>
                <Input
                  type="number"
                  value={serverConnection.reconnectInterval}
                  onChange={(e) =>
                    setServerConnection({
                      ...serverConnection,
                      reconnectInterval: e.target.valueAsNumber,
                    })
                  }
                  placeholder="Reconnect interval"
                  disabled={meteorConnected}
                />
              </div>
              <div className="mt-3 grid w-full items-center gap-1.5">
                <Label htmlFor="email">Max Timeout</Label>
                <Input
                  type="number"
                  value={serverConnection.maxTimeout}
                  onChange={(e) =>
                    setServerConnection({
                      ...serverConnection,
                      maxTimeout: e.target.valueAsNumber,
                    })
                  }
                  placeholder="Max Timeout"
                  disabled={meteorConnected}
                />
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <Switch
                  id="auto-reconnect"
                  checked={serverConnection.autoReconnect}
                  onCheckedChange={(value) =>
                    setServerConnection({
                      ...serverConnection,
                      autoReconnect: value,
                    })
                  }
                />
                <Label htmlFor="auto-reconnect">Auto Reconnect</Label>
              </div>
            </form>
            <DialogFooter>
              <Button className="mt-3" onClick={toggleDialog}>
                Update Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

export default ServerConnection