<?php

/*
 * This file is part of the SkreenHouseFactoryV3Bundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\v3Bundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class MyskreenController extends Controller
{
  public function createNotFoundException($message = 'Not Found', \Exception $previous = null) {
    if ($this->get('kernel')->getEnvironment() == 'prod' &&
        !preg_match('/^(http|https):\/\/www\.myskreen\.com/', $this->getRequest()->getHost())) {
      //echo 'http://www.myskreen.com'.$this->getRequest()->getRequestUri();exit();
      header('Location: http://www.myskreen.com'.$this->getRequest()->getRequestUri(), 301);
      exit();
    }

    return parent::createNotFoundException($message);
  }
}