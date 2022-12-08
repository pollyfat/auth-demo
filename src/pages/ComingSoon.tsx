import { Button, Stack } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useActiveWeb3React } from '../hooks'
import { DOMAIN } from '../constants'
import { useWeb3Instance } from '../hooks/useWeb3Instance'
import { useLoginToken } from '../state/user/hooks'

export default function ComingSoon() {
  const { account } = useActiveWeb3React()
  const web3 = useWeb3Instance()
  const [token, setToken] = useLoginToken()
  const [twitter, setTwitter] = useState()
  const [discord, setDiscord] = useState()
  const requestParams = useMemo(() => {
    return {
      account: account,
      signature: account ? token[account] : ''
    }
  }, [account, token])
  const signatureCallback = useCallback(async () => {
    if (web3 && account) {
      return await web3.eth.personal.sign('Hello Twitter', account, '')
    }
    throw new Error('not login')
  }, [account, web3])

  useEffect(() => {
    axios.post(DOMAIN + '/auth/demo/account/query', requestParams).then(resp => {
      console.log('aaa', resp.data.data[0].TwitterName)
      setTwitter(resp.data.data[0].TwitterName)
      setDiscord(resp.data.data[1].Discorename)
    })
  }, [requestParams])

  // const params = new URLSearchParams(window.location.pathname)

  useEffect(() => {
    if (account) {
      if (token?.[account]) return
      signatureCallback().then(resp => {
        const sign = (resp || '').replace('0x', '')
        const params = {
          account: account,
          signature: sign
        }
        axios
          .post(DOMAIN + '/auth/demo/account/login', params)
          .then(() => {
            setToken(account, sign)
          })
          .catch(error => console.log('error', error))
      })
    }
  }, [account, setToken, signatureCallback, token])

  const handleTwitterAuth = () => {
    console.log('requestParams', requestParams)
    axios.post(DOMAIN + '/auth/demo/twitter/url', requestParams).then(resp => {
      if (resp.status == 200) {
        window.location.href = resp.data.data
      }
    })
  }

  const handleDiscordAuth = () => {
    console.log('requestParams', requestParams)
    axios.post(DOMAIN + '/auth/demo/discord/url', requestParams).then(resp => {
      if (resp.status == 200) {
        window.location.href = resp.data.data
      }
    })
  }

  return (
    <Stack spacing={20}>
      <Button disabled={account == undefined || twitter} onClick={handleTwitterAuth}>
        {twitter ? `已绑定 ${twitter}` : 'Twitter'}
      </Button>
      <Button disabled={account == undefined || discord} onClick={handleDiscordAuth}>
        Discord
      </Button>
    </Stack>
  )
}
