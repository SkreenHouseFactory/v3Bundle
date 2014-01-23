<?php

namespace SkreenHouseFactory\v3Bundle\Entity;

class Ident {

	private $email;
	private $password;

	public function getEmail(){
		return $this->email;
	}
	public function setEmail($email){
		$this->email = $email;
	}

	public function getPassword(){
		return $this->password;
	}
	public function setPassword($password){
		$this->password = $password;
	}

	private $logOk;

	public function getLogOk(){
		return $this->logOk;
	}

	public function refuseConnect(){
		$this->logOk = false;
	}

	public function acceptConnect(){
		$this->logOk = true;
	}

	public function __Construct(){
		$this->refuseConnect();
	}
}