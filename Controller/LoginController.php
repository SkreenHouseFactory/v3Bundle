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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use SkreenHouseFactory\v3Bundle\Entity\Ident;


class LoginController extends Controller
{

  public function indexAction(Request $request)
  {
    $identification = new Ident();

    $form = $this->createFormBuilder($identification)
      ->setAction($this->generateUrl('connexion_compte'))
      ->add('email', 'email')
      ->add('password', 'password') 
      ->add('CONNEXION', 'submit')
      ->getForm();

    return $this->render('SkreenHouseFactoryV3Bundle:Modal:signin.html.twig', array('form' => $form->createView()));
  }

  public function createAction(Request $request)
  {
    $creation = new Ident();

    $form = $this->createFormBuilder($creation)
      ->add('email', 'email')
      ->add('password', 'password')
      ->add('INSCRIPTION', 'submit')
      ->getForm();

    return $this->render('SkreenHouseFactoryV3Bundle:Modal:signup.html.twig', array('form' => $form->createView()));
  }

  public function remindAction(Request $request)
  {
    $remind = new Ident();

    $form = $this->createFormBuilder($creation)
      ->add('email', 'email')
      ->add('password', 'password')
      ->add('INSCRIPTION', 'submit')
      ->getForm();

    return $this->render('SkreenHouseFactoryV3Bundle:Modal:mdp.html.twig', array('form' => $form->createView()));
  }

  public function connectAction(Request $request)
  {
    $identification = new Ident();

    $form = $this->createFormBuilder($identification)
      ->add('email', 'email')
      ->add('password', 'password') 
      ->add('CONNEXION', 'submit')
      ->getForm();

    $form->handleRequest($request);

    $retour = $this->render('SkreenHouseFactoryV3Bundle:Modal:login.html.twig', array('form' => $form->createView()));

    if($form->isValid()){
      if ($this->tryConnect($identification)) {
        $retour = $this->render('SkreenHouseFactoryV3Bundle:Modal:success.html.twig');  
      }
    }

    return $retour;
  }

  private function tryConnect($identification)
  {
    $identification->acceptConnect();
    var_dump($identification->getEmail());
    var_dump($identification->getPassword());
    var_dump($identification->getLogOk());

    die;
    $retour = false;

    $email = $identification->getEmail();
    $password = $identification->getPassword();
      
    if(is_object($user)){
      //il a le droit de se connecter
      $return = true;
    } else {
      // il peut toujours réessayer
    }  

    return $retour;
  }

}